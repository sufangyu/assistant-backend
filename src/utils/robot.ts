import { ROBOT_MESSAGE_TEMPLATE } from '@/enums';
import { Share } from '@/module/share/entities/share.entity';

/**
 * 获取机器人信息配置
 *
 * @export
 * @param {ROBOT_MESSAGE_TEMPLATE} template
 * @param {Partial<Share>[]} share
 * @return {*}
 */
export function getRobotMessageConfig(
  template: ROBOT_MESSAGE_TEMPLATE,
  share: Partial<Share>[],
) {
  const CONFIG_MAP = {
    [ROBOT_MESSAGE_TEMPLATE.EACH]: () => robotMessageConfigEach(share),
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
