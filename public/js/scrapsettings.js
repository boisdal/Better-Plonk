$('#ScrapNavDropdown').addClass('active')

const bindCategoryScanButtons = function () {
    $('.clean-user-table-data').off('click').on('click', (event) => {
        let t0 = $.now()
        let button = $(event.target)
        let link = '/scrap/cleantable/'+button.attr('data-table-name')
        $.post(link, (data) => {
            $("#CleanDataButtonSection").replaceWith(data)
            bindAllScrapSettingsEvents()
            let t1 = $.now()
            let dt = (t1-t0)/1000
            toastNotif('Done', `took ${dt}s`, 'Delete is done')
        })
    })
}

const bindAllScrapSettingsEvents = function() {
    bindCategoryScanButtons()
}

bindAllScrapSettingsEvents()