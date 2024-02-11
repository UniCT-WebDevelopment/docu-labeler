

const TaskCardDropdown = (params) => {
    return (
      <div className="task-dropdown" onClick={params.onClick}>
        <button className="project-task-options-button"></button>
        <div className="task-dropdown-content">
          <a href="#" onClick={params.onExportStart}>Export</a>
          <a href="#" onClick={params.onClick}>Rename</a>
          <a href="#" onClick={params.onDelete}>Delete</a>
        </div>
      </div>
    )
  };
  
  
  export default TaskCardDropdown