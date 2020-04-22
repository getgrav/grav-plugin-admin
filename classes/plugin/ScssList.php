<?php
namespace Grav\Plugin\Admin;

class ScssList {
    protected $list= [];

    public function __construct($item = null)
    {
        if ($item) {
            $this->add($item);
        }
    }

    public function all()
    {
        return $this->list;
    }

    public function add($item)
    {
        $this->list[] = $item;
    }

    public function remove($item)
    {
        if (in_array($item)) {
            unset($item);
        }
    }

}
