<?php

return array(
    'grabber' => array(
        '%.*%' => array(
            'test_url' => 'http://www.jsonline.com/news/usandworld/as-many-as-a-million-expected-for-popes-last-mass-in-us-b99585180z1-329688131.html',
            'body' => array(
                '//div[@id="main"]',
            ),
            'strip' => array(
                '//script',
                'div[contains(@class, "header")]',
                'div[@class="module--headline"]',
                'div[@class="main--inlinemeta"]',
                'div[contains(@class, "leftcol--")]',
                'p[@class="main--author"]',
                'div[@class="story--rightcol"]',
                'div[contains(@class, "footer")]',
                'div[contains(@class, "rightcol--")]',
                'div[contains(@class, "author")]',
            ),
        ),
    ),
);
