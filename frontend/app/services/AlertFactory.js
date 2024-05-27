app.factory("AlertFactory", function ($location) {

    const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
            confirmButton: 'btn btn-primary',
            cancelButton: 'btn btn-danger'
        },
        buttonsStyling: false
    });




    return swalWithBootstrapButtons;
})