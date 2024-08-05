// // export default Exchange;
// import React, { useState } from "react";
// import { sendExchangeAmountToFirebase } from "../../firebaseFunctions"; // Import your Firebase function
// import "./exchange.css";

// interface ExchangeProps {
//   autoIncrement: number;
//   userId: string | null; // Add userId prop to identify the user in Firebase
// }

// const Exchange: React.FC<ExchangeProps> = ({ autoIncrement, userId }) => {
//   const [inputValue, setInputValue] = useState<number>(0); // Start with 0
//   const [error, setError] = useState<string | null>(null); // State for error message
//   const [success, setSuccess] = useState<boolean>(false); // State for success feedback

//   const handlePlus = () => {
//     setInputValue((prevValue) =>
//       Math.min(prevValue + 500, Math.floor(autoIncrement * 3600))
//     );
//   };

//   const handleMinus = () => {
//     setInputValue((prevValue) => Math.max(prevValue - 500, 0));
//   };

//   const handleMax = () => {
//     setInputValue(Math.floor(autoIncrement * 3600));
//   };

//   const handleCancel = () => {
//     setInputValue(0); // Reset input value to 0
//   };

//   const handleExchange = () => {
//     if (inputValue > autoIncrement * 3600) {
//       setError("Input value exceeds the current autoIncrement");
//       return;
//     }

//     if (userId) {
//       sendExchangeAmountToFirebase(userId, inputValue);
//       setInputValue(0); // Reset the input after a successful exchange
//       setSuccess(true); // Set success feedback
//       setError(null); // Clear any previous error
//     } else {
//       setError("User ID is not available.");
//     }
//   };

//   return (
//     <div>
//       <h3>Exchange AutoIncrement</h3>
//       <div>
//         {/*  */}
//         <div   className="exbox1">
//           <input
//           className="exin1"
//             type="text"
//             value={inputValue.toFixed(1)} // Display value to 1 decimal place
//             readOnly
//           />{" "}
//           <button className="exin2"  onClick={handleMax}>Max</button>
//         </div>
//         {/*  */}
//         <div className="exbox2">
//           <button className="exin3" onClick={handleMinus} disabled={inputValue <= 0}>
//             -
//           </button>
//           <button className="exin4" onClick={handleCancel}>Cancel</button>
//           <button
//                className="exin5"
//             onClick={handlePlus}
//             disabled={inputValue >= autoIncrement * 3600}
//           >
//             +
//           </button>
//         </div>
//         {/*  */}
//         <button className="exin6" onClick={handleExchange} disabled={inputValue <= 0}>
//           Exchange
//         </button>
//       </div>
//       {error && <p style={{ color: "red" }}>{error}</p>}
//       {success && !error && (
//         <p style={{ color: "green" }}>Exchange successful!</p>
//       )}
//     </div>
//   );
// };

// export default Exchange;
import React, { useState, useEffect } from "react";
import { sendExchangeAmountToFirebase } from "../../firebaseFunctions"; // Import your Firebase function
import "./exchange.css";
//import { sendExchangeTokenToFirebase } from "../../firebaseFunctions";
import { getDatabase, ref, onValue } from "firebase/database";

interface ExchangeProps {
  autoIncrement: number;
  userId: string | null; // Add userId prop to identify the user in Firebase
}


//01dow is for exchange mechasim
const Exchange: React.FC<ExchangeProps> = ({ autoIncrement, userId }) => {
  const [inputValue, setInputValue] = useState<number>(0); // Start with 0
  const [error, setError] = useState<string | null>(null); // State for error message
  const [success, setSuccess] = useState<boolean>(false); // State for success feedback

  const exchangeRate = 1000;
  const maxExchangeValue = Math.floor(autoIncrement * 3600);

  const isClickable = inputValue > 0 && inputValue <= autoIncrement * 3600;
 
  const handlePlus = () => {
    const newValue = inputValue + 1000;
    const maxExchangeValue = Math.floor(autoIncrement * 3600);
    const remainingValue = maxExchangeValue - newValue;

    console.log("Previous Value:", inputValue);
    console.log("New Value (before condition):", newValue);
    console.log("Max Exchange Value:", maxExchangeValue);
    console.log("Remaining Value after Increment:", remainingValue);

    // Only update if new value does not exceed the maximum and is a full increment
    if (newValue <= maxExchangeValue && remainingValue >= 0) {
      setInputValue(newValue);
      console.log("New inputValue set to:", newValue);
    } else {
      console.log(
        "Increment skipped as it would exceed max or fall short of a full increment."
      );
    }
  };

  const handleMinus = () => {
    setInputValue((prevValue) => Math.max(prevValue - exchangeRate, 0));
  };

  const handleMax = () => {
    // Calculate the maximum exchangeable value that is a multiple of the exchange rate
    const maxValidValue =
      Math.floor(maxExchangeValue / exchangeRate) * exchangeRate;
    setInputValue(maxValidValue);
  };

  const handleCancel = () => {
    setInputValue(0); // Reset input value to 0
  };


  //02down is for visible
const [clickUpgradeLevel, setClickUpgradeLevel] = useState<number>(0);
const [upgradeLevels, setUpgradeLevels] = useState<number[]>([]);

useEffect(() => {
  if (userId) {
    const db = getDatabase();
    const upgradesRef = ref(db, `users/${userId}/upgrades/clickUpgrade`);

    onValue(upgradesRef, (snapshot) => {
      const level = snapshot.val() || 0;
      setClickUpgradeLevel(level);
    });
  }
}, [userId]);
////////
useEffect(() => {
  if (userId) {
    const db = getDatabase();
    const upgradesRef = ref(db, `users/${userId}/upgrades`);

    onValue(upgradesRef, (snapshot) => {
      const data = snapshot.val() || {};
      const levels = [
        data.autoClicker01 || 0,
        data.autoClicker02 || 0,
        data.autoClicker03 || 0,
        data.autoClicker04 || 0,
        data.autoClicker05 || 0,
        data.autoClicker06 || 0,
        data.autoClicker07 || 0,
        data.refClicker01 || 0,
        data.refClicker02 || 0,
      ];
      setUpgradeLevels(levels);
    });
  }
}, [userId]);

const calculateTotalValue = (levels: number[]) => {
  return levels.reduce((acc, level) => acc + (level > 2 ? 1 : 0), 0);
};
const totalValue = calculateTotalValue(upgradeLevels);

////03exchange token

const handleExchange = () => {
   const tokens = Math.floor(inputValue / exchangeRate);

  if (inputValue > autoIncrement*3600) {
    setError('Input value exceeds the current autoIncrement');
    return;
  }

  if (userId) {
    sendExchangeAmountToFirebase(userId, inputValue,tokens);
    setInputValue(0); // Reset the input after a successful exchange
    setSuccess(true); // Set success feedback
    setError(null); // Clear any previous error
  } else {
    setError('User ID is not available.');
  }
};


  return (
    <div>
      <h3>Exchange AutoIncrement</h3>
      {clickUpgradeLevel === 5 && totalValue === 4 && (
      <div className="exchange">
        <div className="exbox1">
          <input
            className="exin1"
            type="text"
            value={inputValue.toFixed(1)}
            readOnly
          />
          <button
            className={`exin2 ${isClickable ? "clickable" : "unclickable"}`}
            onClick={handleMax}
          >
            Max
          </button>
        </div>
        {/*  */}
        <div className="exbox2">
          <button
            className={`exin3 ${
              inputValue > 0 ? "clickable" : "unclickable"
            }`}
            onClick={handleMinus}
            disabled={inputValue <= 0}
          >
            -
          </button>
          <button className="exin4" onClick={handleCancel}>
            Cancel
          </button>
          <button
            className={`exin5 ${
              inputValue < autoIncrement * 3600 ? "clickable" : "unclickable"
            }`}
            onClick={handlePlus}
            disabled={inputValue >= autoIncrement * 3600}
          >
            +
          </button>
        </div>
        <button
          className={`exin6 ${isClickable ? "clickable" : "unclickable"}`}
          onClick={handleExchange}
          disabled={!isClickable}
        >
          Exchange
        </button>
        {error && <p style={{ color: "red" }}>{error}</p>}
        {success && !error && (
          <p style={{ color: "green" }}>Exchange successful!</p>
        )}
      </div>
    )}
    {/*  */}
    </div>
  );
};

export default Exchange;

// const handleExchange = () => {
//   // Calculate how many tokens can be exchanged
//   const tokens = Math.floor(inputValue / exchangeRate); // Determine number of tokens
//   const exchangeAmount = tokens * exchangeRate; // Calculate the actual amount to exchange

//   if (inputValue > maxExchangeValue) {
//     setError("Input value exceeds the current autoIncrement");
//     return;
//   }

//   if (tokens > 0 && userId) {
//     sendExchangeTokenToFirebase(userId, tokens); // Call renamed function
//     setInputValue(0); // Reset the input after a successful exchange
//     setSuccess(true); // Set success feedback
//     setError(null); // Clear any previous error
//   } else {
//     setError("User ID is not available or no valid exchange amount.");
//   }
// };