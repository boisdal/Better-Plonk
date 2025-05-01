$('#ScrapNavDropdown').addClass('active')

const bindScanActivities = function() {
    $('#ScanActivitiesButton').off('click').on('click', () => {
        // Disable all buttons
        let t0 = $.now()
        $.post('/scrap/scanactivities', (data) => {
            console.log(data)
            $("#ScanActivitiesButton").prop('disabled', true)
            $("#ScanActivitiesButton").html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Scanning...')
            waitForTaskCompletion(0, '/scrap/isTaskDone', 10, function() {
                let t1 = $.now()
                let dt = (t1-t0)/1000
                toastNotif('Done', `took ${dt}s`, 'Scan is done')
                $.get('/scrap/getscrapbuttonsection', (data) => {
                    $("#ScrapButtonSection").replaceWith(data)
                    bindAllScrapDataEvents()
                })
            })
        })
    })
}

const bindCategoryScanButtons = function () {
    $('.scan-game-category-details').off('click').on('click', (event) => {
        let t0 = $.now()
        let button = $(event.target)
        let link = button.attr('data-link')
        $.get(link, (data) => {
            if (!data.isOk) {
                toastNotif('Scan error', '', data.reason, 10000, true, 'warning')
            } else {
                button.prop('disabled', true)
                button.html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Scanning...')
                waitForTaskCompletion(0, '/scrap/isTaskDone', 300, function() {
                    let t1 = $.now()
                    let dt = (t1-t0)/1000
                    toastNotif('Done', `took ${dt}s`, 'Scan is done')
                    $.get('/scrap/getscrapbuttonsection', (data) => {
                        $("#ScrapButtonSection").replaceWith(data)
                        bindAllScrapDataEvents()
                    })
                })
            }
        }).fail(function(err) {
            console.warn(err)
        })
    })
}

const bindAllScrapDataEvents = function() {
    bindScanActivities()
    bindCategoryScanButtons()
}

bindAllScrapDataEvents()