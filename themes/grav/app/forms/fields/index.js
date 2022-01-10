import FilepickerField, { Instance as FilepickerFieldInstance } from './filepicker';
import SelectizeField, { Instance as SelectizeFieldInstance } from './selectize';
import ArrayField, { Instance as ArrayFieldInstance } from './array';
import CollectionsField, { Instance as CollectionsFieldInstance } from './collections';
import DateTimeField, { Instance as DateTimeFieldInstance } from './datetime';
import EditorField, { Instance as EditorFieldInstance } from './editor';
import ColorpickerField, { Instance as ColorpickerFieldInstance } from './colorpicker';
import FilesField, { Instance as FilesFieldInstance } from './files';
import FolderFieldInstance from './folder';
import SelectUniqueField, { Instance as SelectUniqueInstance } from './selectunique';
import IconpickerField, { Instance as IconpickerInstance } from './iconpicker';
import CronField, { Instance as CronFieldInstance } from './cron';
import ParentsField, { Instances as ParentsFieldInstance } from './parents';

import './acl-picker';
import './permissions';
import './indeterminate';
import './mediapicker';
import './multilevel';
import './text';
import './range';
import './elements';

export default {
    FilepickerField: {
        FilepickerField,
        Instance: FilepickerFieldInstance
    },
    SelectizeField: {
        SelectizeField,
        Instance: SelectizeFieldInstance
    },
    ArrayField: {
        ArrayField,
        Instance: ArrayFieldInstance
    },
    CollectionsField: {
        CollectionsField,
        Instance: CollectionsFieldInstance
    },
    DateTimeField: {
        DateTimeField,
        Instance: DateTimeFieldInstance
    },
    EditorField: {
        EditorField,
        Instance: EditorFieldInstance
    },
    ColorpickerField: {
        ColorpickerField,
        Instance: ColorpickerFieldInstance
    },
    FilesField: {
        FilesField,
        Instance: FilesFieldInstance
    },
    FolderField: {
        Regenerate: FolderFieldInstance
    },
    SelectUniqueField: {
        SelectUniqueField,
        Instance: SelectUniqueInstance
    },
    IconpickerField: {
        IconpickerField,
        Instance: IconpickerInstance
    },
    CronField: {
        CronField,
        Instance: CronFieldInstance
    },
    ParentsField: {
        ParentsField,
        Instance: ParentsFieldInstance
    }
};
