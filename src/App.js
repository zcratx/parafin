import { useEffect, useState } from "react";
import axios from "axios";
import styled from "styled-components";
import { ParafinWidget } from "@parafin/react";
import { openParafinDashboard } from "@parafin/core";
import { Header } from "./components/Header.tsx";
import { SideNav } from "./components/SideNav.tsx";
import config from "./config";

function App() {
  const [token, setToken] = useState(null);
  const [bnplToken, setBnplToken] = useState(null);
  const [bnplLoading, setBnplLoading] = useState(false);
  const [bnplError, setBnplError] = useState(null);
  const [orderToken, setOrderToken] = useState(null);
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderError, setOrderError] = useState(null);
  const [tab, setTab] = useState("capital");

  useEffect(() => {
    const fetchToken = async () => {
      const response = await axios.get(
        `/parafin/token/capital/${config.capital.personId}/${config.isDev}`
      );
      setToken(response.data.parafinToken);
    };

    fetchToken();
  }, []);

  const handlePayOverTimeClick = async () => {
    setTab("payovertime");
    if (bnplToken) return;
    setBnplLoading(true);
    setBnplError(null);
    try {
      const response = await axios.get(
        `/parafin/token/payovertime/${config.payOverTime.personId}/${config.isDev}`
      );
      if (response.data.errorCode) {
        setBnplError(`Error ${response.data.errorCode}: Failed to fetch Pay Over Time token.`);
        return;
      }
      setBnplToken(response.data.parafinToken);
    } catch (err) {
      setBnplError("Failed to fetch Pay Over Time token.");
    } finally {
      setBnplLoading(false);
    }
  };

  const handleCheckoutClick = async () => {
    setTab("checkout");
    if (orderToken) {
      openParafinDashboard({
        product: "bnpl",
        token: orderToken,
        orderId: config.checkout.orderId,
        onExit: (orderId) => {
          console.log("Checkout exited for orderId:", orderId);
          setOrderLoading(false);
        },
      });
      return;
    }
    setOrderLoading(true);
    setOrderError(null);
    try {
      const response = await axios.get(
        `/parafin/token/checkout/${config.checkout.personId}/${config.isDev}`
      );
      if (response.data.errorCode) {
        setOrderError(`Error ${response.data.errorCode}: Failed to fetch Checkout token.`);
        return;
      }
      const token = response.data.parafinToken;
      setOrderToken(token);
      openParafinDashboard({
        product: "bnpl",
        token,
        orderId: config.checkout.orderId,
        onExit: (orderId) => {
          console.log("Checkout exited for orderId:", orderId);
          setOrderLoading(false);
        },
      });
    } catch (err) {
      setOrderError("Failed to launch Checkout flow.");
    } finally {
      setOrderLoading(false);
    }
  };

  const onOptIn = async () => ({
    businessExternalId: "<your-external-business-id>",
    legalBusinessName: "Hearty Kitchens LLC",
    dbaName: "Hearty Kitchens",
    ownerFirstName: "Ralph",
    ownerLastName: "Furman",
    accountManagers: [
      {
        name: "Vineet Goel",
        email: "test1@parafin.com",
      },
    ],
    routingNumber: "121141822",
    accountNumberLastFour: "6789",
    bankAccountCurrencyCode: "USD",
    email: "test2@parafin.com",
    phoneNumber: "2026331000",
    address: {
      addressLine1: "301 Howard St",
      city: "San Francisco",
      state: "CA",
      postalCode: "94105",
      country: "USA",
    },
  });

  if (!token) {
    return <LoadingShell>loading...</LoadingShell>;
  }

  return (
    <div>
      <Header />
      <ContentShell>
        <SideNav
          onClick={(newProduct) => {
            if (newProduct === "payovertime") {
              handlePayOverTimeClick();
            } else if (newProduct === "checkout") {
              handleCheckoutClick();
            } else {
              setTab(newProduct);
            }
          }}
          bnplLoading={bnplLoading}
          orderLoading={orderLoading}
        />
        {tab === "capital" && (
          <PageShell>
            <ParafinWidget
              token={token}
              product="capital"
              // Optional props below, see docs.parafin.com for more information
              externalBusinessId={undefined}
              onOptIn={onOptIn}
            />
          </PageShell>
        )}
        {tab === "payovertime" && (
          <PageShell>
            {bnplLoading && <ErrorText style={{color: "#555"}}>Loading Pay Over Time...</ErrorText>}
            {bnplError && <ErrorText>{bnplError}</ErrorText>}
            {!bnplLoading && !bnplError && bnplToken && (
              <ParafinWidget
                token={bnplToken}
                product="line_of_credit"
                lineOfCreditApplicationId={config.payOverTime.lineOfCreditApplicationId}
                onExit={() => {}}
              />
            )}
          </PageShell>
        )}
        {tab === "checkout" && (
          <PageShell>
            {orderLoading && <ErrorText style={{color: "#555"}}>Loading Checkout...</ErrorText>}
            {orderError && <ErrorText>{orderError}</ErrorText>}
            {!orderLoading && !orderError && !orderToken && (
              <ErrorText style={{color: "#555"}}>
                Configure checkout.personId and checkout.orderId in src/config.js and BNPL credentials in .env to use Checkout.
              </ErrorText>
            )}
          </PageShell>
        )}
      </ContentShell>
    </div>
  );
}

export default App;

const ContentShell = styled.div`
  display: flex;
  flex-direction: row;
`;

const LoadingShell = styled.div`
  padding: 20px;
`;

const PageShell = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px;
  gap: 40px;
  max-width: 1100px;
`;

const ErrorText = styled.p`
  color: #c0392b;
  padding: 16px;
`;
