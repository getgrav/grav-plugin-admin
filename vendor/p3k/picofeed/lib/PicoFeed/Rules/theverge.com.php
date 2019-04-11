<?php
return array(
    'grabber' => array(
        '%.*%' => array(
            'test_url' => 'https://www.theverge.com/2017/11/11/16624298/mindhunter-netflix-show-david-fincher-review',
            'body' => array(
                '//figure[@class="e-image e-image--hero"]/span[@class="e-image__inner"]',
                '//div[@class="c-entry-content"]',
            ),
            'strip' => array(
                '//div[@class="c-related-list"]',
                '//div[@class="c-page-title"]',
            )
        ),
    ),
);
