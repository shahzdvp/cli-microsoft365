import * as chalk from 'chalk';
import { Logger } from '../../../../cli';
import {
  CommandOption
} from '../../../../Command';
import GlobalOptions from '../../../../GlobalOptions';
import request from '../../../../request';
import Utils from '../../../../Utils';
import GraphCommand from '../../../base/GraphCommand';
import commands from '../../commands';

interface CommandArgs {
  options: Options;
}

interface Options extends GlobalOptions {
  allowCreateUpdateChannels?: string;
  allowDeleteChannels?: string;
  teamId: string;
}

class TeamsGuestSettingsSetCommand extends GraphCommand {
  private static props: string[] = [
    'allowCreateUpdateChannels',
    'allowDeleteChannels'
  ];

  public get name(): string {
    return `${commands.TEAMS_GUESTSETTINGS_SET}`;
  }

  public get description(): string {
    return 'Updates guest settings of a Microsoft Teams team';
  }

  public getTelemetryProperties(args: CommandArgs): any {
    const telemetryProps: any = super.getTelemetryProperties(args);
    TeamsGuestSettingsSetCommand.props.forEach(p => {
      telemetryProps[p] = (args.options as any)[p];
    });
    return telemetryProps;
  }

  public commandAction(logger: Logger, args: CommandArgs, cb: () => void): void {
    const data: any = {
      guestSettings: {}
    };
    TeamsGuestSettingsSetCommand.props.forEach(p => {
      if (typeof (args.options as any)[p] !== 'undefined') {
        data.guestSettings[p] = (args.options as any)[p] === 'true';
      }
    });

    const requestOptions: any = {
      url: `${this.resource}/v1.0/teams/${encodeURIComponent(args.options.teamId)}`,
      headers: {
        accept: 'application/json;odata.metadata=none'
      },
      data: data,
      responseType: 'json'
    };

    request
      .patch(requestOptions)
      .then((): void => {
        if (this.verbose) {
          logger.log(chalk.green('DONE'));
        }

        cb();
      }, (err: any) => this.handleRejectedODataJsonPromise(err, logger, cb));
  }

  public options(): CommandOption[] {
    const options: CommandOption[] = [
      {
        option: '-i, --teamId <teamId>',
        description: 'The ID of the Teams team for which to update settings'
      },
      {
        option: '--allowCreateUpdateChannels [allowCreateUpdateChannels]',
        description: 'Set to true to allow guests to create and update channels and to false to disallow it'
      },
      {
        option: '--allowDeleteChannels [allowDeleteChannels]',
        description: 'Set to true to allow guests to create and update channels and to false to disallow it'
      }
    ];

    const parentOptions: CommandOption[] = super.options();
    return options.concat(parentOptions);
  }

  public validate(args: CommandArgs): boolean | string {
    if (!Utils.isValidGuid(args.options.teamId)) {
      return `${args.options.teamId} is not a valid GUID`;
    }

    let isValid: boolean = true;
    let value, property: string = '';
    TeamsGuestSettingsSetCommand.props.every(p => {
      property = p;
      value = (args.options as any)[p];
      isValid = typeof value === 'undefined' ||
        value === 'true' ||
        value === 'false';
      return isValid;
    });
    if (!isValid) {
      return `Value ${value} for option ${property} is not a valid boolean`;
    }

    return true;
  }
}

module.exports = new TeamsGuestSettingsSetCommand();