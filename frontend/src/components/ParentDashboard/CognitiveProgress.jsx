import React from 'react';

const CognitiveProgress = () => {
  const skills = [
    { name: "Problem Solving", level: "Advanced" },
    { name: "Critical Thinking", level: "Intermediate" },
    { name: "Focus Duration", level: "Improving" }
  ];

  return (
    <div className="dashboard-card">
      <h3 className="card-title">Cognitive Progress</h3>
      <div className="skills-container">
        {skills.map((skill, index) => (
          <div key={index} className="skill-row">
            <span className="skill-name">{skill.name}</span>
            <span className={`skill-tag ${skill.level.toLowerCase()}`}>
              {skill.level}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CognitiveProgress;