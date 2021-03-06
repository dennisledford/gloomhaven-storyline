<template>
    <div>
        <div class="pt-16 pb-4 px-4 flex flex-col">
            <div class="w-full flex justify-center">
                <h1>{{ $t('Global') }} {{ $t('Achievements') }}</h1>
            </div>
            <div class="w-full flex justify-center">
                <ul v-if="achievements" id="global-achievements" class="mdc-list bg-black2-25 p-2 rounded-lg mt-4"
                    ref="global-list">
                    <li v-for="achievement in achievements.items"
                        v-if="achievement.isGlobal() && achievement.awarded && !achievement.hidden"
                        :key="achievement.id"
                        class="mdc-list-item h-auto cursor-pointer"
                        :data-id="achievement.id"
                        :tabindex="achievement.id">
                        <template>
                    <span class="mdc-list-item__text opacity-75">
                        {{ achievement.displayName }}
                    </span>
                        </template>
                    </li>
                </ul>
            </div>
        </div>
        <div class="pt-4 pb-4 px-4 flex flex-wrap">
            <div class="w-full flex justify-center">
                <h1>{{ $t('Party') }} {{ $t('Achievements') }}</h1>
            </div>
            <div class="w-full flex justify-center">
                <ul v-if="achievements" id="party-achievements" class="mdc-list bg-black2-25 p-2 rounded-lg mt-4"
                    ref="party-list">
                    <li v-for="achievement in achievements.items"
                        v-if="achievement.isParty() && achievement.awarded"
                        :key="achievement.id"
                        class="mdc-list-item h-auto cursor-pointer"
                        :data-id="achievement.id"
                        :tabindex="achievement.id">
                        <template>
                    <span class="mdc-list-item__text opacity-75">
                        {{ achievement.name }}
                    </span>
                        </template>
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>

<script>
    import AchievementRepository from "../repositories/AchievementRepository";
    import {MDCList} from "@material/list/component";

    export default {
        data() {
            return {
                globalList: null,
                partyList: null,
                achievements: null,
                regionFilter: null,
                missedTreasuresFilter: null,
                stateFilter: null,
                filter: null,
                achievementRepository: new AchievementRepository()
            }
        },
        mounted() {
            if (app.achievements) {
                this.setAchievements();
            }

            this.$bus.$on('achievements-updated', this.setAchievements);
        },
        destroyed() {
            if (this.globalList) {
                this.globalList.destroy();
            }
            if (this.partyList) {
                this.partyList.destroy();
            }
            this.$bus.$off('achievements-updated', this.setAchievements);
        },
        methods: {
            async setAchievements() {
                this.achievements = app.achievements;

                await this.$nextTick();

                this.globalList = MDCList.attachTo(this.$refs['global-list']);
                this.globalList.listen('MDCList:action', (event) => {
                    let id = $(event.target).find('li:eq(' + event.detail.index + ')').data('id');
                    this.open(this.achievementRepository.find(id));
                });
                this.partyList = MDCList.attachTo(this.$refs['party-list']);
                this.partyList.listen('MDCList:action', (event) => {
                    let id = $(event.target).find('li:eq(' + event.detail.index + ')').data('id');
                    this.open(this.achievementRepository.find(id));
                });
            },
            open(achievement) {
                this.$bus.$emit('open-achievement', {
                    id: achievement.id
                });
            },
        }
    }
</script>
