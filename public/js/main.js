const toastNotif = function(title, subtitle, body, delay=3000, autohide=true, type='info') {
  let d = new Date()
  let id = 'liveToast' + d.toString('yyyyMMddHHmmss') + d.getMilliseconds()
  let icon = 'circle-info'
  if (type == 'warning') {icon = 'triangle-exclamation'}
  if (type == 'error') {icon = 'square-xmark'}
  let container = $('#ToastContainer')
  let newToastHtml = `<div id="${id}" class="toast custom-toast-${type}" role="alert" aria-live="assertive" aria-atomic="true">
    <div class="toast-header">
    <i class="fa fa-xl fa-${icon}"></i>
    <strong class="ps-3 me-auto">${title}</strong>
    <small>${subtitle}</small>
    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>
    <div class="toast-body">
    ${body}
    </div>
  </div>`
  container.append(newToastHtml)
  let toastLiveExample = document.getElementById(id)
  let toastConfig = {delay, autohide}
  let toast = new bootstrap.Toast(toastLiveExample, toastConfig)
  toast.show()
}

