$('#ScrapNavDropdown').addClass('active')

const bindScanActivities = function() {
    $('#ScanActivitiesButton').off('click').on('click', () => {
        $.post('/scrap/scanactivities', (data) => {
            console.log(data)
            $("#ScanActivitiesButton").replaceWith('<button id="ScanActivitiesButton" class="btn btn-primary" type="button" disabled><span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Scanning...</button>')
            // Disable all buttons
            let cnt = 0
            let interval = setInterval(function() {
                $.get('/scrap/isTaskDone', (data) => {
                    console.log(data)
                    if (data.isDone) {
                        // Add a user notification to inform
                        $.get('/scrap/getscrapbuttonsection', (data) => {
                            $("#ScrapButtonSection").replaceWith(data)
                            bindAllScrapDataEvents()
                        })
                        clearInterval(interval)
                    }
                    if (cnt > 30) {
                        console.warn('30 seconds have passed and still not done. Try refreshing later')
                        // Add a user notification to inform
                        clearInterval(interval)
                    } else {
                        cnt ++
                    }
                })
            }, 1000)
        })
    })
}

const bindAllScrapDataEvents = function() {
    bindScanActivities()
}

bindAllScrapDataEvents()