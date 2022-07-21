import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";

export const FontAwesomeObj = (props) => {
  const [isFocused, setIsFocused] = useState(false);
  const { icon, brandColor, title, titleClassName, size, className } = props;
  const [hasTitle] = useState(title === undefined ? false : true);
  return (
    <div
      className={"text-sm flex w-full gap-2 items-center " + className}
      onMouseEnter={() => {
        setIsFocused(true);
      }}
      onMouseLeave={() => {
        setIsFocused(false);
      }}
    >
      <FontAwesomeIcon
        icon={icon}
        size={size ? size : "1x"}
        className="w-6 h-6"
        color={isFocused ? brandColor : "white"}
      />
      {hasTitle ? (
        isFocused ? (
          <div className={titleClassName + " text-" + brandColor + "-400"}>
            {title}
          </div>
        ) : (
          <div className={titleClassName}>{title}</div>
        )
      ) : null}
    </div>
  );
};
