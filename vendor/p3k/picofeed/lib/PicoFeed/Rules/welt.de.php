<?php
return array(
    'grabber' => array(
        '%.*%' => array(
            'test_url' => 'https://www.welt.de/debatte/kommentare/article169740590/Bloss-keine-sozialdemokratische-Konsenssause.html',
            'body' => array(
                '//main/article/header/div/div[contains(@class, "c-summary")]/div',
                '//main/article/header/div[3]/div/figure/div/div/div/picture[1]',
                '//main/article/header/div[3]/div/figure/figcaption/child::*',
                '//main/article/div[contains(@class, "c-article-text")]'
            ),
            'strip' => array(
                '//*[contains(@class, "c-inline-element--has-commercials")]',
                '//*[contains(@class, "c-inline-teaser")]',
                '//figure[contains(@class, "c-video-element")]',
                '//main/article/div[contains(@class, "c-article-text")]/div[@class="c-inline-element"]/div[contains(@class, "c-image-element")]'
            ),
        ),
    ),
);
