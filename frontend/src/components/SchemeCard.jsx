import React from "react";

const SchemeCard = ({ scheme, onApply, onSave, onView }) => {
  return (
    <div className="card">
      <h3>{scheme.title}</h3>
      <p>{scheme.description}</p>

      <button onClick={() => onView(scheme._id)}>View</button>
      <button onClick={() => onApply(scheme._id)}>Apply</button>
      <button onClick={() => onSave(scheme._id)}>Save</button>
    </div>
  );
};

export default SchemeCard;