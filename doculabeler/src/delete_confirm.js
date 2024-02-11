

export const DeleteConfirm = (params) => {
    const onDelete = params.onDelete;
    const onCancelDelete = params.onCancelDelete;
    return (
        <div id="overlay" onClick={(e) => {e.preventDefault();}}> 
            <div id="publish-project-warning">
                <h3> Are you sure you want to delete this project? </h3>
                <h4> All images and annotation will be permanently deleted.</h4>
                <h4><b>This action cannot be undone.</b></h4>
                <div id="publish-project-btn-container">
                    <button className="confirm-button" onClick={onDelete}>Confirm</button>
                    <button className="cancel-button" onClick={onCancelDelete}>Cancel</button>
                </div>
            </div>
        </div>
    )
}