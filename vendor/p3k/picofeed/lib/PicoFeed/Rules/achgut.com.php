<?php
return array(
    'grabber' => array(
        '%.*%' => array(
            'test_url' => 'http://www.achgut.com/artikel/deutscher_herbst_wg_reichsstrasse_106',
            'body' => array(
                '//div[@class="headerpict_half"]/div/img',
                '//div[@class="beitrag"]/div[@class="teaser_blog_text"]'
            ),
            'strip' => array(
                '//div[@class="footer_blog_text"]',
                '//div[@class="beitrag"]/div[@class="teaser_blog_text"]/h2[1]'
            )
        ),
    ),
);
