/**
 * Taro Admin Extension
 *
 * Registers the Taro admin UI extensions (components, etc.)
 * These are UI elements specific to the admin app.
 */

import type { Component } from 'vue';
import UserTaroSection from './components/UserTaroSection.vue';

export interface AdminExtension {
  userDetailsSections?: Component[];
}

export const taroAdminExtension: AdminExtension = {
  userDetailsSections: [UserTaroSection],
};

export default taroAdminExtension;
