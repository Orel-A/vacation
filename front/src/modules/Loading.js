import React from "react";
import FontAwesome from "react-fontawesome";

const Loading = () => {
  return (
    <div className="modal-dialog text-center">
      <FontAwesome name="spinner" size="5x" pulse inverse style={{zIndex: 1050}}  />
      <div className="modal-backdrop show" />
    </div>
  );
};

export default Loading;