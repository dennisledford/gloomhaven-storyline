<template>
    <div>
        <button type="button" @click="toggle"
                class="mdc-icon-button material-icons mdc-button--raised fixed left-0 top-area-inset-top mt-1 p-2 mt-2 ml-2 z-5 i-bg-black2-50 rounded-full">
            menu
        </button>

        <aside ref="menu" class="mdc-drawer mdc-drawer--modal">
            <div class="mdc-drawer__header" style="min-height: 0;">
                <a href="/">
                    <webp class="w-3/4 mt-4" alt="Gloomhaven" src="/img/gloomhaven-logo.png"/>
                </a>
            </div>
            <div class="mdc-drawer__content">
                <div v-if="showCampaignSwitch" class="m-2" style="width: calc(100% - 1em);">
                    <campaign-switch ref="campaign-switch"></campaign-switch>
                </div>
                <div class="mdc-list-group">
                    <!--
                    <div v-if="user" class="mx-4 mb-4 flex items-center">
                        <span class="inline-block h-10 w-10 rounded-full overflow-hidden bg-gray-100">
                            <img class="h-full w-full"
                                 :src="gravatar()"/>
                        </span>
                        <div class="text-white2-87 flex-1 ml-4 flex flex-col">
                            <span class="text-lg">{{ user.name }}</span>
                            <span class="text-sm">{{ user.email }}</span>
                        </div>
                    </div>
                    -->

                    <ul ref="list" class="mdc-list">
                        <li @click="toggle">
                            <router-link to="/campaigns" class="mdc-list-item"
                                         active-class="mdc-list-item--activated">
                                <i class="material-icons mdc-list-item__graphic"
                                   aria-hidden="true">supervisor_account</i>
                                <span class="mdc-list-item__text">
                                    {{ $t('Campaigns') }}
                                    <span v-if="!user" class="ml-2 text-gold font-bold">{{ $t('PRO') }}</span>
                                </span>
                            </router-link>
                        </li>

                        <li role="separator" class="mdc-list-divider i-my-2"></li>

                        <li @click="toggle">
                            <router-link to="/story" class="mdc-list-item" active-class="mdc-list-item--activated">
                                <inline-svg src="icons/story" class="mdc-list-item__graphic" aria-hidden="true"/>
                                <span class="mdc-list-item__text">{{ $t('Storyline') }}</span>
                            </router-link>
                        </li>

                        <li @click="toggle">
                            <router-link to="/map" class="mdc-list-item" active-class="mdc-list-item--activated">
                                <i class="material-icons mdc-list-item__graphic" aria-hidden="true">map</i>
                                <span class="mdc-list-item__text">{{ $t('Map') }}</span>
                            </router-link>
                        </li>

                        <li @click="toggle">
                            <router-link to="/scenarios" class="mdc-list-item"
                                         active-class="mdc-list-item--activated">
                                <i class="material-icons mdc-list-item__graphic" aria-hidden="true">list</i>
                                <span class="mdc-list-item__text">{{ $t('Scenario list') }}</span>
                            </router-link>
                        </li>

                        <li @click="toggle">
                            <router-link to="/achievements" class="mdc-list-item"
                                         active-class="mdc-list-item--activated">
                                <inline-svg style="width: 16px" src="icons/achievements"
                                            class="mdc-list-item__graphic ml-1"
                                            aria-hidden="true"/>
                                <span class="mdc-list-item__text">{{ $t('Achievements') }}</span>
                            </router-link>
                        </li>

                        <li @click="toggle">
                            <router-link to="/party" class="mdc-list-item"
                                         active-class="mdc-list-item--activated">
                                <i class="material-icons mdc-list-item__graphic" aria-hidden="true">assignment</i>
                                <span class="mdc-list-item__text">{{ $t('Party sheet') }}</span>
                            </router-link>
                        </li>

                        <li role="separator" class="mdc-list-divider i-my-2"></li>
                    </ul>
                </div>
                <div class="mdc-list-group">
                    <ul>
                        <li>
                            <a class="mdc-list-item"
                               @click="shareCurrentStory">
                                <i class="material-icons mdc-list-item__graphic" aria-hidden="true">share</i>
                                <span class="mdc-list-item__text">{{ $t('Share') }}</span>
                            </a>
                        </li>

                        <li>
                            <a class="mdc-list-item" @click="$bus.$emit('open-reset-modal')">
                                <i class="material-icons mdc-list-item__graphic"
                                   aria-hidden="true">delete_forever</i>
                                <span class="mdc-list-item__text">{{ $t('Reset') }}</span>
                            </a>
                        </li>

                        <li @click="toggle">
                            <router-link to="/info" class="mdc-list-item" active-class="mdc-list-item--activated">
                                <i class="material-icons mdc-list-item__graphic"
                                   aria-hidden="true">info</i>
                                <span class="mdc-list-item__text">{{ $t('Info') }}</span>
                            </router-link>
                        </li>

                        <li role="separator" class="mdc-list-divider i-my-2"></li>

                        <li v-if="!loggedIn" class="py-4 w-full" @click="toggle">
                            <router-link to="/campaigns" class="flex justify-center -ml-6">
                                <button
                                    class="relative text-light-gray py-1 pl-3 pr-8 border border-light-gray border-solid rounded-full"
                                    type="submit">
                                    {{ $t('Buy me a Beer') }}
                                    <span
                                        class="absolute top-0 right-0 -mt-2 -mr-6 bg-black text-2xl h-12 w-12 leading-12 border-2 border-light-gray border-solid rounded-full">🍻</span>
                                </button>
                            </router-link>
                        </li>
                    </ul>
                </div>
                <div class="lgh:absolute lgh:bottom-0 m-2" style="width: calc(100% - 1em);">
                    <language-switch @help="toggle"></language-switch>
                </div>
            </div>
        </aside>

        <div class="mdc-drawer-scrim"></div>

        <div class="mdc-drawer-app-content w-full">
            <slot name="content"></slot>
        </div>
    </div>
</template>

<script>
import {MDCDrawer} from "@material/drawer/component";
import Helpers from "../../services/Helpers";
import AuthRepository from "../../apiRepositories/AuthRepository";
import StoryRepository from "../../repositories/StoryRepository";

const md5 = require('js-md5');

export default {
    data() {
        return {
            drawer: null,
            list: null,
            user: null,
            loggedIn: Helpers.loggedIn(),
            showCampaignSwitch: false,
            auth: new AuthRepository(),
            storyRepository: new StoryRepository
        }
    },
    mounted() {
        this.drawer = MDCDrawer.attachTo(this.$refs['menu']);
        this.$bus.$on('campaigns-changed', this.setUser);
    },
    methods: {
        toggle() {
            this.drawer.open = !this.drawer.open;

            // load campaign options
            if (this.drawer.open && this.showCampaignSwitch) {
                this.$refs['campaign-switch'].applyData();
            }
        },
        async logout() {
            this.auth.logout();
            await app.switchCampaign('local');

            location.reload();
        },
        setUser() {
            this.user = app.user;

            if (this.user && this.shouldOpenShare()) {
                this.shareCurrentStory();
                Helpers.removeQueryString();
            }

            this.showCampaignSwitch = app.stories.count() > 0;
        },
        shouldOpenShare() {
            return location.search.includes('share');
        },
        gravatar() {
            const hash = md5(this.user.email);
            return `https://www.gravatar.com/avatar/${hash}?d=identicon`;
        },
        shareCurrentStory() {
            if (app.campaignId === 'local') {
                this.$bus.$emit('open-share-modal');
            } else {
                this.$bus.$emit('open-share-campaign-code-modal', this.storyRepository.current());
            }
        }
    }
}
</script>

<style scoped lang="scss">
.mdc-drawer__content {
    overflow-x: hidden;
}
</style>
