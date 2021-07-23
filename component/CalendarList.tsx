import { Checkbox } from "antd";
import { CheckboxValueType } from "antd/lib/checkbox/Group";

export interface CalendarInfo {
  id: string;
  title: string;
}

interface Props {
  calendars: CalendarInfo[];
  selected: string[];
  onChange: (checkedValue: string[]) => void;
}

export const CalendarList = (props: Props) => {
  const { calendars, selected, onChange } = props;
  const options = calendars.map((c) => ({
    label: c.title,
    value: c.id,
  }));

  return (
    <div>
      <div>Calendar lists</div>
      <Checkbox.Group
        options={options}
        value={selected}
        onChange={(newValue) => onChange(newValue as string[])}
      />
    </div>
  );
};
