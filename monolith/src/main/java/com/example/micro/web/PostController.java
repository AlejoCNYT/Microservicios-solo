package com.example.micro.web;

import com.example.micro.model.Post;
import com.example.micro.model.StreamTopic;
import com.example.micro.model.User;
import com.example.micro.repo.PostRepository;
import com.example.micro.repo.StreamRepository;
import com.example.micro.repo.UserRepository;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api")
public class PostController {

    private final PostRepository posts;
    private final UserRepository users;
    private final StreamRepository streams;

    public PostController(PostRepository posts, UserRepository users, StreamRepository streams) {
        this.posts = posts;
        this.users = users;
        this.streams = streams;
    }

    @GetMapping("/posts")
    public List<Post> all() {
        return posts.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
    }

    public static class NewPost { public Long userId; public Long streamId; public String content; }

    @PostMapping("/posts")
    public ResponseEntity<?> create(@RequestBody @Validated NewPost req) {
        if (req == null || req.content == null || req.content.trim().isEmpty() || req.content.length() > 140) {
            return ResponseEntity.badRequest().body("content must be 1..140 chars");
        }
        User u = users.findById(req.userId).orElse(null);
        StreamTopic s = streams.findById(req.streamId).orElse(null);
        if (u == null || s == null) {
            return ResponseEntity.badRequest().body("invalid user or stream");
        }
        Post p = new Post();
        p.setUser(u);
        p.setStream(s);
        p.setContent(req.content.trim());
        p.setCreatedAt(Instant.now());
        return ResponseEntity.ok(posts.save(p));
    }
}