<?php

/**
 * @package    Grav\Plugin\Admin
 *
 * @copyright  Copyright (c) 2015 - 2024 Trilby Media, LLC. All rights reserved.
 * @license    MIT License; see LICENSE file for details.
 */

namespace Grav\Plugin\Admin;

use ArrayAccess;
use Exception;
use Grav\Common\Data\Blueprint;
use Grav\Common\Data\Data;
use Grav\Framework\Form\Interfaces\FormFlashInterface;
use Grav\Framework\Form\Interfaces\FormInterface;
use Grav\Framework\Form\Traits\FormTrait;
use InvalidArgumentException;
use JsonSerializable;

/**
 * Class AdminForm
 * @package Grav\Plugin\Admin
 */
class AdminForm implements FormInterface, JsonSerializable
{
    use FormTrait;

    /** @var string */
    protected $nonce_name;
    /** @var string */
    protected $nonce_action;
    /** @var callable */
    protected $submitMethod;

    /**
     * AdminForm constructor.
     *
     * @param string $name
     * @param array $options
     */
    public function __construct(string $name, array $options)
    {
        $this->name = $name;
        $this->nonce_name = $options['nonce_name'] ?? 'admin-nonce';
        $this->nonce_action = $options['nonce_action'] ?? 'admin-form';

        $this->setId($options['id'] ?? $this->getName());
        $this->setUniqueId($options['unique_id'] ?? $this->getName());
        $this->setBlueprint($options['blueprint']);
        $this->setSubmitMethod($options['submit_method'] ?? null);
        $this->setFlashLookupFolder('tmp://admin/forms/[SESSIONID]');

        if (!empty($options['reset'])) {
            $this->getFlash()->delete();
        }

        $this->initialize();
    }

    /**
     * @return $this
     */
    public function initialize(): AdminForm
    {
        $this->messages = [];
        $this->submitted = false;
        $this->unsetFlash();

        /** @var FormFlashInterface $flash */
        $flash = $this->getFlash();
        if ($flash->exists()) {
            $data = $flash->getData();
            if (null !== $data) {
                $data = new Data($data, $this->getBlueprint());
                $data->setKeepEmptyValues(true);
                $data->setMissingValuesAsNull(true);
            }

            $this->data = $data;
            $this->files = $flash->getFilesByFields(false);
        } else {
            $this->data = new Data([], $this->getBlueprint());
            $this->files = [];
        }

        return $this;
    }

    /**
     * @return string
     */
    public function getNonceName(): string
    {
        return $this->nonce_name;
    }

    /**
     * @return string
     */
    public function getNonceAction(): string
    {
        return $this->nonce_action;
    }

    /**
     * @return string
     */
    public function getScope(): string
    {
        return 'data.';
    }

    /**
     * @param Blueprint $blueprint
     */
    public function setBlueprint(Blueprint $blueprint): void
    {
        if (null === $blueprint) {
            throw new InvalidArgumentException('Blueprint is required');
        }

        $this->blueprint = $blueprint;
    }

    /**
     * @param string $field
     * @param mixed $value
     */
    public function setData(string $field, $value): void
    {
        $this->getData()->set($field, $value);
    }

    /**
     * @return Blueprint
     */
    public function getBlueprint(): Blueprint
    {
        return $this->blueprint;
    }

    /**
     * @param callable|null $submitMethod
     */
    public function setSubmitMethod(?callable $submitMethod): void
    {
        if (null === $submitMethod) {
            throw new InvalidArgumentException('Submit method is required');
        }

        $this->submitMethod = $submitMethod;
    }

    /**
     * @param array $data
     * @param array $files
     * @return void
     * @throws Exception
     */
    protected function doSubmit(array $data, array $files): void
    {
        $method = $this->submitMethod;
        $method($data, $files);

        $this->reset();
    }

    /**
     * Filter validated data.
     *
     * @param ArrayAccess|Data|null $data
     * @return void
     */
    protected function filterData($data = null): void
    {
        if ($data instanceof Data) {
            $data->filter(true, true);
        }
    }
}
