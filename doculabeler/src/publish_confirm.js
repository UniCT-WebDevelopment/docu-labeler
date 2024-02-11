

export const PublishConfirm = (params) => {
    const onPublish = params.onPublish;
    const onCancelPublish = params.onCancelPublish;
    return (
        <div id="overlay" onClick={(e) => {e.preventDefault();}}> 
            <div id="publish-project-warning">
                <h3> Are you sure you want to make this project public? </h3>
                <h4> Once published, this project will be accessible, modifiable, and exportable by <b>everyone</b>. </h4>
                <div id="publish-project-btn-container">
                    <button className="confirm-button" onClick={onPublish}>Confirm</button>
                    <button className="cancel-button" onClick={onCancelPublish}>Cancel</button>
                </div>
            </div>
        </div>
    )
}