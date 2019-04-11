<?php
return array(
    'grabber' => array(
        '%.*%' => array(
            'test_url' => 'http://www.bauerwilli.com/intuitive-eating/',
            'body' => array(
                '//div[@class="entry-thumbnail"]',
                '//div[@class="entry-content"]',
            ),
            'strip' => array(
                '//div[@class="tptn_counter"]',
                '//div[contains(@class, "sharedaddy")]'
            ),
        ),
    ),
);

