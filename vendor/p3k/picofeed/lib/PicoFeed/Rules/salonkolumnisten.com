<?php
return array(
    'grabber' => array(
        '%.*%' => array(
            'test_url' => 'https://www.salonkolumnisten.com/schulpolitik-niedersachsen/',
            'body' => array(
                '//div[@id="main"]/div[contains(@class, "featimg")]',
                '//div[@id="main"]/article/div[contains(@class, "entry-content")]',
            ),
            'strip' => array(
                '//div[@id="main"]/article/div[contains(@class, "entry-content")]/a[1]',
                '//div[@id="main"]/article/div[contains(@class, "entry-content")]/a[1]',
            ),
        ),
    ),
);

