<?php

return array(
    'grabber' => array(
        '%.*%' => array(
            'test_url' => 'https://medium.com/lessons-learned/917b8b63ae3e',
            'body' => array(
                '//div[contains(@class, "post-field body")]',
                '//div[contains(@class, "section-inner layoutSingleColumn")]',
            ),
            'strip' => array(
            ),
        ),
    ),
);
