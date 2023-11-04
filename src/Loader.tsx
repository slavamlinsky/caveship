import React from "react";

const Loader: React.FC = () => {
  return (
    <div className="preloader">
      <div className="lds-hourglass"></div>
    </div>
  );
};

export default Loader;