import styled from "styled-components";

interface Props {
  title: string | number;
  value: string | number;
}

export const BarTooltip = ({ title, value }: Props) => (
  <Container>{title + " - " + value}</Container>
);

const Container = styled.div`
  background: white;
  padding: 4px;
  border-radius: 4px;
  box-shadow: rgba(0, 0, 0, 0.16) 0px 1px 4px;
`;
