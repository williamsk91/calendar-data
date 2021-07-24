import { Checkbox } from "antd";

export interface DataInfo {
  id: string;
  title: string;
}

interface Props {
  data: DataInfo[];
  selected: string[];
  onChange: (checkedValue: string[]) => void;
}

export const CheckboxGroup = (props: Props) => {
  const { data, selected, onChange } = props;
  const options = data.map((c) => ({
    label: c.title,
    value: c.id,
  }));

  return (
    <Checkbox.Group
      options={options}
      value={selected}
      onChange={(newValue) => onChange(newValue as string[])}
    />
  );
};
