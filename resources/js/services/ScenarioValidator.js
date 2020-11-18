import ScenarioRepository from "../repositories/ScenarioRepository";
import AchievementRepository from "../repositories/AchievementRepository";
import {ScenarioState} from "../models/ScenarioState";
import QuestValidator from "./QuestValidator";
import ChoiceService from "./ChoiceService";
import AchievementValidator from "./AchievementValidator";
import StorySyncer from "./StorySyncer";

export default class ScenarioValidator {

    validate(shouldSync = true) {
        this.needsValidating = true;
        let count = 1;

        while (this.needsValidating) {
            this.needsValidating = false;
            app.scenarios.each((scenario) => {
                this.checkHidden(scenario);
                this.checkChoice(scenario);
                this.checkRequired(scenario);
            });
            if (count > 4) {
                this.needsValidating = false;
            }
            count++;
        }

        this.achievementValidator.validate();
        this.questValidator.validate();
        if (shouldSync) {
            this.storySyncer.store();
        }
    }

    checkHidden(scenario) {
        let states = this.linkedStates(scenario);
        let unlocked = this.scenarioRepository.isScenarioUnlockedByTreasure(scenario);

        if (scenario.isHidden()) {
            if (states.has(ScenarioState.complete) || unlocked || scenario.id === 1) {
                this.scenarioRepository.setIncomplete(scenario);
                this.needsValidating = true;
            }
        } else {
            if (states.has(ScenarioState.complete) === false && !scenario.is_side && scenario.id !== 1 && !unlocked) {
                this.scenarioRepository.setHidden(scenario);
                this.needsValidating = true;
            }
        }
    }

    checkChoice(scenario) {
        let linkedScenarios = this.linkedScenarios(scenario);
        let unlocked = this.scenarioRepository.isScenarioUnlockedByTreasure(scenario);

        if (linkedScenarios.where('hasChoices', true).count()) {
            let chosen = linkedScenarios.firstWhere('_choice', scenario.id);
            let withoutChoicesStates = linkedScenarios.where('hasChoices', false).pluck('state', 'state');

            if (scenario.isHidden()) {
                if (chosen || withoutChoicesStates.has(ScenarioState.complete) || unlocked) {
                    this.scenarioRepository.setIncomplete(scenario);
                    this.needsValidating = true;
                }
            } else {
                if (!chosen && withoutChoicesStates.has(ScenarioState.complete) === false && !unlocked) {
                    this.scenarioRepository.setHidden(scenario);
                    this.needsValidating = true;
                }
            }
        }

        if (scenario.hasChoices && scenario.choice && scenario.isIncomplete()) {
            scenario.choice = null;
        }

        if (scenario.hasPrompt && scenario.isIncomplete()) {
            let promptConfig = this.choiceService.getPromptConfig(scenario);
            if (typeof promptConfig.callback === 'function') {
                promptConfig.callback(null);
            }
        }
    }

    checkRequired(scenario) {
        if (scenario.isHidden() || scenario.isComplete() || scenario.required_by.isEmpty()) {
            return;
        }
        let conditions = scenario.required_by;

        let blocking_conditions = scenario.blocks_on;
        let shouldBeBlocked = blocking_conditions.contains((condition) => {
            let complete = condition.complete || [];
            let completeCheck = complete.length && complete.every((achievementId) => {
                let achievement = this.achievementRepository.find(achievementId) || {};
                return achievement.awarded;
            });
            let lost = condition.lost || [];
            let lostCheck = lost.length && lost.every((achievementId) => {
                let achievement = this.achievementRepository.find(achievementId) || {};
                return achievement.lost;
            });
            return completeCheck || lostCheck;
        });

        if (shouldBeBlocked) {
            if (!scenario.isBlocked()) {
                this.scenarioRepository.setBlocked(scenario);
                this.needsValidating = true;
            }
            return;
        }

        let shouldBeRequired = conditions.contains((condition) => {
            let incomplete = condition.incomplete || [];
            let allIncompleteRequirementsOk = incomplete.every((achievementId) => {
                let achievement = this.achievementRepository.find(achievementId) || {};
                return !achievement.awarded;
            });
            let complete = condition.complete || [];
            let allCompleteRequirementsOk = complete.every((achievementId) => {
                let achievement = this.achievementRepository.find(achievementId) || {};
                return achievement.awarded;
            });
            return allIncompleteRequirementsOk && allCompleteRequirementsOk;
        }) === false;

        if (shouldBeRequired && !scenario.isRequired()) {
            this.scenarioRepository.setRequired(scenario);
            this.needsValidating = true;
        }

        if (!shouldBeBlocked && !shouldBeRequired && !scenario.isIncomplete()) {
            this.scenarioRepository.setIncomplete(scenario);
            this.needsValidating = true;
        }
    }

    linkedScenarios(scenario) {
        return this.scenarioRepository.findMany(scenario.linked_from);
    }

    linkedStates(scenario) {
        return this.linkedScenarios(scenario).pluck('state', 'state');
    }

    get scenarioRepository() {
        return this._scenarioRepository || (this._scenarioRepository = new ScenarioRepository);
    }

    get achievementRepository() {
        return this._achievementRepository || (this._achievementRepository = new AchievementRepository);
    }

    get achievementValidator() {
        return this._achievementValidator || (this._achievementValidator = new AchievementValidator);
    }

    get questValidator() {
        return this._questValidator || (this._questValidator = new QuestValidator);
    }

    get choiceService() {
        return this._choiceService || (this._choiceService = new ChoiceService);
    }

    get storySyncer() {
        return this._storySyncer || (this._storySyncer = new StorySyncer);
    }
}
