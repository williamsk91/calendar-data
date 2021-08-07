import { Select, Tag } from "antd";

export interface CheckboxDataInfo {
  id: string;
  title: string;
  color: string;
}

interface Props {
  data: CheckboxDataInfo[];
  selected: string[];
  onChange: (checkedValue: string[]) => void;
}

export const CheckboxGroup = (props: Props) => {
  const { data, selected, onChange } = props;
  const options = data.map((c) => ({
    label: c.title,
    value: c.id,
    color: c.color,
  }));

  function tagRender(props: any) {
    const { label, value, closable, onClose } = props;
    const option = options.find((o) => o.value === value);
    return (
      <Tag
        color={option?.color ?? "blue"}
        // prevent select from opening
        onMouseDown={(event) => {
          event.preventDefault();
          event.stopPropagation();
        }}
        closable={closable}
        onClose={onClose}
        style={{ marginRight: 3 }}
      >
        {label}
      </Tag>
    );
  }

  return (
    <Select
      options={options}
      value={selected}
      onChange={(newValue) => onChange(newValue as string[])}
      mode="multiple"
      tagRender={tagRender}
      size="large"
      bordered={false}
      style={{ display: "block" }}
    />
  );
};
