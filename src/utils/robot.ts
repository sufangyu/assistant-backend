import * as dayjs from 'dayjs';
import { RobotMessageTemplateEnum } from '@/enum';
import { Share } from '@/module/share/entities/share.entity';

// 飞书信息模版配置：https://open.feishu.cn/tool/cardbuilder?templateId=ctp_AAf5BFHpTQUV

/**
 * 获取机器人信息配置
 *
 * @export
 * @param {RobotMessageTemplateEnum} template
 * @param {Partial<Share>[]} share
 * @return {*}
 */
export function getRobotMessageConfig(
  template: RobotMessageTemplateEnum,
  share: Partial<Share>[],
  title?: string,
) {
  const CONFIG_MAP = {
    [RobotMessageTemplateEnum.EACH]: () => robotMessageConfigEach(share),
    [RobotMessageTemplateEnum.MONTH]: () =>
      robotMessageConfigReport(share, title),
    [RobotMessageTemplateEnum.QUARTER]: () =>
      robotMessageConfigReport(share, title),
  };

  return CONFIG_MAP[template] && CONFIG_MAP[template]();
}

/**
 * 获取每篇配置
 *
 * @param {Partial<Share>[]} share
 * @return {*}
 */
function robotMessageConfigEach(share: Partial<Share>[]) {
  const [data] = share;
  return {
    msg_type: 'interactive',
    card: {
      elements: [
        {
          tag: 'markdown',
          content: `<at id=all></at>，${data.description}`,
        },
        {
          actions: [
            {
              tag: 'button',
              text: {
                content: '点击阅读详情 :玫瑰:',
                tag: 'lark_md',
              },
              url: `${data.url}`,
              type: 'primary',
            },
          ],
          tag: 'action',
        },
      ],
      header: {
        template: 'blue',
        title: {
          content: `📚【好文推荐】${data.title}`,
          tag: 'lark_md',
        },
      },
    },
  };
}

function robotMessageConfigReport(shares: Partial<Share>[], title: string) {
  // console.log(shares, title);
  const elements = [];
  (shares ?? []).forEach((share) => {
    elements.push(
      {
        tag: 'div',
        text: {
          content: `**${share.title ?? '-'}** \n ${
            share.description ?? '-'
          }【[查看详情>>](${share.url})】`,
          tag: 'lark_md',
        },
      },
      { tag: 'hr' },
    );
  });

  return {
    msg_type: 'interactive',
    card: {
      header: {
        template: 'purple',
        title: {
          tag: 'plain_text',
          content: `📚 ${title ?? '-'}`,
        },
      },
      elements: [
        ...elements,
        {
          actions: [
            {
              tag: 'button',
              text: {
                content: '查看更多分享好文',
                tag: 'plain_text',
              },
              type: 'primary',
              url: '#',
            },
          ],
          tag: 'action',
        },
        { tag: 'hr' },
        {
          elements: [
            {
              content: `推送时间：${dayjs().format('YYYY-MM-DD HH:mm')}`,
              tag: 'plain_text',
            },
          ],
          tag: 'note',
        },
      ],
    },
  };
}
