package com.example.micro.web;

import com.example.micro.model.Post;
import com.example.micro.model.StreamTopic;
import com.example.micro.model.User;
import com.example.micro.repo.PostRepository;
import com.example.micro.repo.StreamRepository;
import com.example.micro.repo.UserRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class PostController {

    private final UserRepository users;
    private final StreamRepository streams;
    private final PostRepository posts;

    public PostController(UserRepository users, StreamRepository streams, PostRepository posts) {
        this.users = users;
        this.streams = streams;
        this.posts = posts;
    }

    @PostMapping("/users")
    public ResponseEntity<User> createUser(@RequestBody @Valid User u) {
        User saved = users.save(u);
        return ResponseEntity.created(URI.create("/api/users/" + saved.getId())).body(saved);
    }

    @PostMapping("/streams")
    public ResponseEntity<StreamTopic> createStream(@RequestBody @Valid StreamTopic s) {
        StreamTopic saved = streams.save(s);
        return ResponseEntity.created(URI.create("/api/streams/" + saved.getId())).body(saved);
    }

    public static class NewPost {
    public Long userId;
    public Long streamId;
    public String content;

    public NewPost() {}
    public NewPost(Long userId, Long streamId, String content) {
        this.userId = userId;
        this.streamId = streamId;
        this.content = content;
    }

    // Métodos tipo record para mantener compatibilidad con req.userId, etc.
    public Long userId()   { return userId; }
    public Long streamId() { return streamId; }
    public String content(){ return content; }
}
    @PostMapping("/posts")
    public ResponseEntity<Post> createPost(@RequestBody @Valid NewPost req) {
        if (req.content == null || req.content.length() > 140) {
            return ResponseEntity.badRequest().build();
        }
        User u = users.findById(req.userId).orElseThrow();
        StreamTopic st = streams.findById(req.streamId).orElseThrow();
        Post p = new Post();
        p.setUser(u);
        p.setStream(st);
        p.setContent(req.content);
        Post saved = posts.save(p);
        return ResponseEntity.created(URI.create("/api/posts/" + saved.getId())).body(saved);
    }

    @GetMapping("/streams/{id}/posts")
    public List<Post> postsByStream(@PathVariable Long id) {
        StreamTopic s = streams.findById(id).orElseThrow();
        return posts.findTop20ByStreamOrderByCreatedAtDesc(s);
    }

    @GetMapping("/users/{id}/posts")
    public List<Post> postsByUser(@PathVariable Long id) {
        User u = users.findById(id).orElseThrow();
        return posts.findTop20ByUserOrderByCreatedAtDesc(u);
    }
}

