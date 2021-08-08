import styled from "styled-components";

/**
 * A utility component to create vertical spacing between components.
 */
export const Spacer = styled.div<{ size: string }>`
  margin-top: ${(p) => p.size}px;
  display: block;
`;
