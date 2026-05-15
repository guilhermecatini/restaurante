(function () {
    'use strict';

    angular.module('deliveryApp.admin').controller('AdminTeamController', AdminTeamController);

    AdminTeamController.$inject = ['AdminService', 'UiFeedbackService', 'AuthService'];
    function AdminTeamController(AdminService, UiFeedbackService, AuthService) {
        var vm = this;

        var ROLE_LABELS = {
            restaurant_owner: 'Proprietário',
            restaurant_manager: 'Gerente',
            restaurant_operator: 'Operador',
        };

        vm.members = [];
        vm.loading = false;
        vm.saving = false;

        vm.modal = false;
        vm.inviteForm = { email: '', role: 'restaurant_operator' };

        vm.currentUser = AuthService.getCurrentUser() || {};

        vm.roleOptions = [
            { value: 'restaurant_owner', label: 'Proprietário' },
            { value: 'restaurant_manager', label: 'Gerente' },
            { value: 'restaurant_operator', label: 'Operador' },
        ];

        vm.roleLabel = function (role) { return ROLE_LABELS[role] || role; };

        vm.isSelf = function (member) {
            return vm.currentUser && member.user_id === vm.currentUser.id;
        };

        // ---- Invite --------------------------------------------------------
        vm.openInvite = function () {
            vm.inviteForm = { email: '', role: 'restaurant_operator' };
            vm.modal = true;
        };

        vm.closeModal = function () { vm.modal = false; vm.saving = false; };

        vm.invite = function () {
            if (vm.saving) return;
            vm.saving = true;
            AdminService.inviteTeamMember(vm.inviteForm)
                .then(function () {
                    UiFeedbackService.success('Membro convidado com sucesso!');
                    vm.closeModal();
                    loadTeam();
                })
                .catch(function (err) {
                    var msg = (err && err.data && err.data.message) || 'Erro ao convidar membro.';
                    UiFeedbackService.error(msg);
                })
                .finally(function () { vm.saving = false; });
        };

        // ---- Change role ---------------------------------------------------
        vm.changeRole = function (member) {
            AdminService.updateTeamMemberRole(member.id, member.role)
                .then(function () { UiFeedbackService.success('Cargo atualizado!'); })
                .catch(function () {
                    UiFeedbackService.error('Erro ao atualizar cargo.');
                    loadTeam(); // revert
                });
        };

        // ---- Remove --------------------------------------------------------
        vm.removeMember = function (member) {
            UiFeedbackService.confirm('Remover ' + (member.name || member.email) + ' da equipe?', '')
                .then(function (confirmed) {
                    if (!confirmed) return;
                    AdminService.removeTeamMember(member.id)
                        .then(function () { UiFeedbackService.success('Membro removido!'); loadTeam(); })
                        .catch(function () { UiFeedbackService.error('Erro ao remover membro.'); });
                });
        };

        // ---- Load ----------------------------------------------------------
        function loadTeam() {
            vm.loading = true;
            AdminService.getTeam()
                .then(function (members) { vm.members = members; })
                .catch(function () { UiFeedbackService.error('Erro ao carregar equipe.'); })
                .finally(function () { vm.loading = false; });
        }

        loadTeam();
    }
})();
