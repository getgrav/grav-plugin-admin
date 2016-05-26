import SelectizeField, { Instance as SelectizeFieldInstance } from './selectize';
import ArrayField, { Instance as ArrayFieldInstance } from './array';
import CollectionsField, { Instance as CollectionsFieldInstance } from './collections';
import DateTimeField, { Instance as DateTimeFieldInstance } from './datetime';
import EditorField, { Instance as EditorFieldInstance } from './editor';
import ColorpickerField, { Instance as ColorpickerFieldInstance } from './colorpicker';
import './files';

export default {
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
    }
};
