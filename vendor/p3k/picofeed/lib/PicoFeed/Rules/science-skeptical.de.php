<?php
return array(
    'grabber' => array(
        '%.*%' => array(
            'test_url' => 'http://www.science-skeptical.de/politik/diesel-die-lueckenmedien-im-glashaus-6/0016080/',
            'body' => array(
                '//div[@class="pf-content"]',
            ),
            'strip' => array(
                '//div[contains(@class, "printfriendly")]',
            )
        ),
    ),
);
