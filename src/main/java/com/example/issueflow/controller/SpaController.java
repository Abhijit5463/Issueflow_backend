package com.example.issueflow.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SpaController {

    @GetMapping({ "/", "/{path:[^\\.]*}", "/{path:^(?!api|v3|swagger-ui|error).*$}/**" })
    public String forward() {
        return "forward:/index.html";
    }
}
