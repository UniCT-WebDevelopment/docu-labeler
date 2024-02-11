

export const PrivateConfirm = (params) => {
    const onPublish = params.onPrivate;
    const onCancelPublish = params.onCancelPrivate;
    return (
        <div id="overlay" onClick={(e) => {e.preventDefault();}}> 
            <div id="publish-project-warning">
                <h3> Are you sure you want to make this project private? </h3>
                <h4> Once private, this project will be accessible, modifiable, and exportable <b>only by you</b>. </h4>
                <div id="publish-project-btn-container">
                    <button className="confirm-button" onClick={onPublish}>Confirm</button>
                    <button className="cancel-button" onClick={onCancelPublish}>Cancel</button>
                </div>
            </div>
        </div>
    )
}