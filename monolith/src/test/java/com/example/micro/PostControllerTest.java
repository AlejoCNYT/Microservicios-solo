package com.example.micro;

import com.example.micro.model.StreamTopic;
import com.example.micro.model.User;
import com.example.micro.repo.StreamRepository;
import com.example.micro.repo.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class PostControllerTest {

    @Autowired MockMvc mvc;
    @Autowired UserRepository users;
    @Autowired StreamRepository streams;

    Long uid; Long sid;

    @BeforeEach
    void setup() {
        users.deleteAll();
        streams.deleteAll();
        User u = users.save(newUser("dan", "d@e.com"));
        StreamTopic s = streams.save(newStream("general"));
        uid = u.getId();
        sid = s.getId();
    }

    @Test
    void createPost_ok_when140charsOrLess() throws Exception {
        String body = "{\"userId\":" + uid + ",\"streamId\":" + sid + ",\"content\":\"hola\"}";
        mvc.perform(post("/api/posts").contentType(MediaType.APPLICATION_JSON).content(body))
           .andExpect(status().isCreated());
    }

    private static User newUser(String username, String email) {
        User u = new User(); u.setUsername(username); u.setEmail(email); return u;
    }

    private static StreamTopic newStream(String name) {
        StreamTopic s = new StreamTopic(); s.setName(name); return s;
    }
}
