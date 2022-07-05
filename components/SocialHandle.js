import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";

export const SocialHandle = (props) => {
  const [isFocused, setIsFocused] = useState(false);
  return (
    <div>
      <FontAwesomeIcon
        icon={props.icon}
        className="w-6 h-6"
        onMouseEnter={() => {
          setIsFocused(true);
        }}
        onMouseLeave={() => {
          setIsFocused(false);
        }}
        color={isFocused ? props.brandColor : "white"}
      />
    </div>
  );
};
