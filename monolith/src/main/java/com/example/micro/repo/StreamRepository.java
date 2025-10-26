package com.example.micro.repo;
import com.example.micro.model.StreamTopic;
import org.springframework.data.jpa.repository.JpaRepository;
public interface StreamRepository extends JpaRepository<StreamTopic, Long> {}
