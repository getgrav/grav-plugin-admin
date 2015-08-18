<?php
namespace Grav\Plugin;

use \Grav\Common\Grav;

class AdminTwigExtension extends \Twig_Extension
{
    protected $grav;

    public function __construct()
    {
        $this->grav = Grav::instance();
        $this->lang = $this->grav['user']->language;
    }

    /**
     * Returns extension name.
     *
     * @return string
     */
    public function getName()
    {
        return 'AdminTwigExtension';
    }

    public function getFilters()
    {
        return [
            new \Twig_SimpleFilter('tu', [$this, 'tuFilter']),

        ];
    }

    public function tuFilter()
    {
        return $this->grav['admin']->translate(func_get_args(), [$this->grav['user']->authenticated ? $this->lang : 'en']);
    }
}
