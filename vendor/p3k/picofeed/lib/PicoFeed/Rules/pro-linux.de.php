<?php
return array(
    'grabber' => array(
        '%.*%' => array(
            'test_url' => 'https://www.pro-linux.de/news/1/25252/chrome-62-erschienen.html',
            'body' => array(
                '//div[@id="news"]',
            ),
            'strip' => array(
                '//h3[@class="topic"]',
                '//h2[@class="title"]',
                '//div[@class="picto"]',
            ),
        ),
    ),
);
