import React from "react";
import styled from "styled-components";
import { partnerColor, partnerColorAlpha } from "./Header.tsx";

export const SideNav = ({
  onClick,
  bnplLoading,
  orderLoading,
}: {
  onClick: (product: string) => void;
  bnplLoading?: boolean;
  orderLoading?: boolean;
}) => {
  return (
    <SideNavShell>
      <StyledSideNav>
        <StyledNavItem onClick={() => onClick("capital")}>
          Capital
        </StyledNavItem>
        <StyledNavItem onClick={() => !bnplLoading && onClick("payovertime")} $disabled={bnplLoading}>
          {bnplLoading ? "Loading..." : "Pay Over Time - Line of Credit"}
        </StyledNavItem>
        <StyledNavItem onClick={() => !orderLoading && onClick("checkout")} $disabled={orderLoading}>
          {orderLoading ? "Loading..." : "Pay Over Time - Checkout"}
        </StyledNavItem>
      </StyledSideNav>
    </SideNavShell>
  );
};

const SideNavShell = styled.div`
  display: flex;
  align-items: center;
  height: 100%;
  padding: 20px;
`;

const StyledSideNav = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const StyledNavItem = styled.div<{ $accent?: boolean; $disabled?: boolean }>`
  display: flex;
  color: ${({ $accent }) => ($accent ? "#fff" : partnerColor)};
  background-color: ${({ $accent, $disabled }) =>
    $disabled ? "#aaa" : $accent ? partnerColor : partnerColorAlpha};
  padding: 8px 16px;
  border-radius: 4px;
  justify-content: center;
  cursor: ${({ $disabled }) => ($disabled ? "not-allowed" : "pointer")};
  font-weight: ${({ $accent }) => ($accent ? "600" : "normal")};
  opacity: ${({ $disabled }) => ($disabled ? "0.7" : "1")};
  &:hover {
    opacity: ${({ $disabled }) => ($disabled ? "0.7" : "0.85")};
  }
`;
