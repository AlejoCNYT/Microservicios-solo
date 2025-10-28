package com.example.micro.repo;
import com.example.micro.model.Post;
import com.example.micro.model.StreamTopic;
import com.example.micro.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PostRepository extends JpaRepository<Post, Long> {
    List<Post> findTop20ByStreamOrderByCreatedAtDesc(StreamTopic stream);
    List<Post> findTop20ByUserOrderByCreatedAtDesc(User user);
}
