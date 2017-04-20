var modal
__jud_define__('@jud-component/toast', [], function(__jud_require__) {
    modal = __jud_require__('@jud-module/modal')
})

module.exports = function(msg) {
    modal.toast({message: msg})
}