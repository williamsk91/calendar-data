import { DatePicker } from "antd";
import moment from "moment";

moment.updateLocale("en", {
  week: {
    dow: 1,
  },
});

interface Props {
  week: Date;
  onChange: (week: Date) => void;
}

export const WeekPicker = (props: Props) => {
  const { week, onChange } = props;
  return (
    <DatePicker
      picker="week"
      value={moment(week)}
      onChange={(date) => {
        onChange(date?.toDate() ?? new Date());
      }}
      allowClear={false}
      format="YYYY wo [week]"
    />
  );
};
