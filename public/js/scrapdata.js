$('#ScrapNavDropdown').addClass('active')

const bindScanActivities = function() {
    $('#ScanActivitiesButton').off('click').on('click', () => {
        $.post('/scrap/scanactivities', (data) => {
            console.log(data)
            // Do shit to display the wait
            // Disable all buttons
            let cnt = 0
            let interval = setInterval(function() {
                $.get('/scrap/isTaskDone', (data) => {
                    console.log(data)
                    if (data.isDone) {
                        clearInterval(interval)
                    } else {
                        console.log('still not done')
                    }
                    if (cnt > 10) {
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