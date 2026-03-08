import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ActivityLogService } from '../../activity-log/activity-log.service';

type RequestWithUser = Request & {
  user?: {
    userId: string;
    role: string;
    email?: string;
  };
  cookies?: Record<string, string>;
};

@Injectable()
export class ActivityLogInterceptor implements NestInterceptor {
  private readonly logger = new Logger(ActivityLogInterceptor.name);

  private static readonly actionRules: Array<{
    method: string;
    pattern: RegExp;
    action: string;
  }> = [
    {
      method: 'POST',
      pattern: /^\/users\/[^/]+\/reset-password$/,
      action: 'reset_user_password',
    },
    {
      method: 'PATCH',
      pattern: /^\/users\/[^/]+\/status$/,
      action: 'update_user_status',
    },
    { method: 'PATCH', pattern: /^\/users\/[^/]+$/, action: 'update_user' },
    { method: 'DELETE', pattern: /^\/users\/[^/]+$/, action: 'delete_user' },
    { method: 'POST', pattern: /^\/students$/, action: 'create_student' },
    {
      method: 'PATCH',
      pattern: /^\/students\/[^/]+$/,
      action: 'update_student',
    },
    {
      method: 'DELETE',
      pattern: /^\/students\/[^/]+$/,
      action: 'delete_student',
    },
    { method: 'POST', pattern: /^\/teachers$/, action: 'create_teacher' },
    {
      method: 'PATCH',
      pattern: /^\/teachers\/[^/]+$/,
      action: 'update_teacher',
    },
    {
      method: 'DELETE',
      pattern: /^\/teachers\/[^/]+$/,
      action: 'delete_teacher',
    },
    { method: 'POST', pattern: /^\/parents$/, action: 'create_parent' },
    {
      method: 'PATCH',
      pattern: /^\/parents\/[^/]+$/,
      action: 'update_parent',
    },
    {
      method: 'DELETE',
      pattern: /^\/parents\/[^/]+$/,
      action: 'delete_parent',
    },
    { method: 'POST', pattern: /^\/admins$/, action: 'create_admin' },
    { method: 'PATCH', pattern: /^\/admins\/[^/]+$/, action: 'update_admin' },
    {
      method: 'DELETE',
      pattern: /^\/admins\/[^/]+$/,
      action: 'delete_admin',
    },
    { method: 'POST', pattern: /^\/classes$/, action: 'create_class' },
    {
      method: 'PATCH',
      pattern: /^\/classes\/[^/]+$/,
      action: 'update_class',
    },
    {
      method: 'DELETE',
      pattern: /^\/classes\/[^/]+$/,
      action: 'delete_class',
    },
    {
      method: 'POST',
      pattern: /^\/classes\/[^/]+\/students$/,
      action: 'enroll_student_to_class',
    },
    {
      method: 'DELETE',
      pattern: /^\/classes\/[^/]+\/students\/[^/]+$/,
      action: 'remove_student_from_class',
    },
    {
      method: 'POST',
      pattern: /^\/classes\/[^/]+\/teachers$/,
      action: 'assign_teacher_to_class',
    },
    {
      method: 'DELETE',
      pattern: /^\/classes\/[^/]+\/teachers\/[^/]+$/,
      action: 'remove_teacher_from_class',
    },
    {
      method: 'POST',
      pattern: /^\/classes\/[^/]+\/courses$/,
      action: 'assign_course_to_class',
    },
    {
      method: 'PATCH',
      pattern: /^\/classes\/[^/]+\/courses\/[^/]+\/status$/,
      action: 'update_class_course_status',
    },
    {
      method: 'DELETE',
      pattern: /^\/classes\/[^/]+\/courses\/[^/]+$/,
      action: 'remove_course_from_class',
    },
    { method: 'POST', pattern: /^\/courses$/, action: 'create_course' },
    {
      method: 'PATCH',
      pattern: /^\/courses\/[^/]+$/,
      action: 'update_course',
    },
    {
      method: 'DELETE',
      pattern: /^\/courses\/[^/]+$/,
      action: 'delete_course',
    },
    { method: 'GET', pattern: /^\/courses\/[^/]+$/, action: 'view_course' },
    {
      method: 'GET',
      pattern: /^\/courses\/[^/]+\/learn$/,
      action: 'start_learning_course',
    },
    {
      method: 'POST',
      pattern: /^\/courses\/modules$/,
      action: 'create_module',
    },
    {
      method: 'PATCH',
      pattern: /^\/courses\/modules\/[^/]+$/,
      action: 'update_module',
    },
    {
      method: 'DELETE',
      pattern: /^\/courses\/modules\/[^/]+$/,
      action: 'delete_module',
    },
    {
      method: 'POST',
      pattern: /^\/courses\/sections$/,
      action: 'create_section',
    },
    {
      method: 'PATCH',
      pattern: /^\/courses\/sections\/[^/]+$/,
      action: 'update_section',
    },
    {
      method: 'DELETE',
      pattern: /^\/courses\/sections\/[^/]+$/,
      action: 'delete_section',
    },
    {
      method: 'POST',
      pattern: /^\/courses\/[^/]+\/teachers\/[^/]+$/,
      action: 'assign_teacher_to_course',
    },
    {
      method: 'POST',
      pattern: /^\/assignments$/,
      action: 'create_assignment',
    },
    {
      method: 'PATCH',
      pattern: /^\/assignments\/[^/]+$/,
      action: 'update_assignment',
    },
    {
      method: 'DELETE',
      pattern: /^\/assignments\/[^/]+$/,
      action: 'delete_assignment',
    },
    {
      method: 'POST',
      pattern: /^\/assignments\/assign-to-students$/,
      action: 'assign_assignment_to_students',
    },
    {
      method: 'POST',
      pattern: /^\/assignments\/submit$/,
      action: 'submit_assignment',
    },
    {
      method: 'PATCH',
      pattern: /^\/assignments\/student-assignments\/[^/]+\/grade$/,
      action: 'grade_assignment',
    },
    {
      method: 'POST',
      pattern: /^\/assignments\/student-assignments\/[^/]+\/regrade-ai$/,
      action: 'regrade_assignment_ai',
    },
    {
      method: 'GET',
      pattern: /^\/assignments\/student-assignments\/[^/]+\/ai-suggestion$/,
      action: 'view_ai_grading_suggestion',
    },
    {
      method: 'POST',
      pattern: /^\/assignments\/assign-to-section$/,
      action: 'assign_assignment_to_section',
    },
    {
      method: 'DELETE',
      pattern: /^\/assignments\/sections\/[^/]+\/assignments\/[^/]+$/,
      action: 'remove_assignment_from_section',
    },
    {
      method: 'POST',
      pattern: /^\/assignments\/targets$/,
      action: 'create_assignment_target',
    },
    {
      method: 'DELETE',
      pattern: /^\/assignments\/targets\/[^/]+$/,
      action: 'delete_assignment_target',
    },
    {
      method: 'GET',
      pattern: /^\/assignments\/[^/]+\/results$/,
      action: 'view_assignment_results',
    },
    {
      method: 'POST',
      pattern: /^\/question-bank$/,
      action: 'create_question',
    },
    {
      method: 'PATCH',
      pattern: /^\/question-bank\/[^/]+$/,
      action: 'update_question',
    },
    {
      method: 'DELETE',
      pattern: /^\/question-bank\/[^/]+$/,
      action: 'delete_question',
    },
    {
      method: 'POST',
      pattern: /^\/question-bank\/assign-to-kp$/,
      action: 'assign_question_to_kp',
    },
    {
      method: 'DELETE',
      pattern: /^\/question-bank\/kps\/[^/]+\/questions\/[^/]+$/,
      action: 'remove_question_from_kp',
    },
    {
      method: 'POST',
      pattern: /^\/question-bank\/generate$/,
      action: 'generate_question',
    },
    {
      method: 'POST',
      pattern: /^\/knowledge-points$/,
      action: 'create_knowledge_point',
    },
    {
      method: 'PATCH',
      pattern: /^\/knowledge-points\/[^/]+$/,
      action: 'update_knowledge_point',
    },
    {
      method: 'DELETE',
      pattern: /^\/knowledge-points\/[^/]+$/,
      action: 'delete_knowledge_point',
    },
    {
      method: 'POST',
      pattern: /^\/knowledge-points\/assign-to-section$/,
      action: 'assign_kp_to_section',
    },
    {
      method: 'DELETE',
      pattern: /^\/knowledge-points\/sections\/[^/]+\/kps\/[^/]+$/,
      action: 'remove_kp_from_section',
    },
    {
      method: 'POST',
      pattern: /^\/knowledge-points\/generate-content$/,
      action: 'generate_kp_content',
    },
    {
      method: 'POST',
      pattern: /^\/learning-paths$/,
      action: 'create_learning_path',
    },
    {
      method: 'PATCH',
      pattern: /^\/learning-paths\/[^/]+$/,
      action: 'update_learning_path',
    },
    {
      method: 'DELETE',
      pattern: /^\/learning-paths\/[^/]+$/,
      action: 'delete_learning_path',
    },
    {
      method: 'PATCH',
      pattern: /^\/learning-paths\/[^/]+\/items\/[^/]+\/status$/,
      action: 'update_learning_path_item_status',
    },
    {
      method: 'POST',
      pattern: /^\/student-progress\/submit-question$/,
      action: 'submit_question_answer',
    },
    {
      method: 'POST',
      pattern: /^\/student-progress\/submit-content-question$/,
      action: 'submit_content_question_answer',
    },
    {
      method: 'POST',
      pattern: /^\/student-progress\/track-time$/,
      action: 'track_time_on_task',
    },
    {
      method: 'POST',
      pattern: /^\/student-progress\/kp-progress$/,
      action: 'update_kp_progress',
    },
    {
      method: 'POST',
      pattern: /^\/upload\/avatar$/,
      action: 'upload_avatar',
    },
    { method: 'POST', pattern: /^\/upload\/file$/, action: 'upload_file' },
    {
      method: 'POST',
      pattern: /^\/upload\/document$/,
      action: 'upload_document',
    },
    {
      method: 'POST',
      pattern: /^\/explorer\/courses\/[^/]+\/clone$/,
      action: 'clone_course',
    },
    {
      method: 'GET',
      pattern: /^\/explorer\/courses$/,
      action: 'browse_public_courses',
    },
    {
      method: 'GET',
      pattern: /^\/explorer\/courses\/[^/]+$/,
      action: 'view_public_course',
    },
    {
      method: 'GET',
      pattern: /^\/dashboard\/search$/,
      action: 'search_dashboard',
    },
  ];

  constructor(private readonly activityLogService: ActivityLogService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    if (!user || !this.shouldTrack(request)) {
      return next.handle();
    }

    const activity = this.buildActivityPayload(request, user);
    if (!this.shouldPersistAction(activity.action)) {
      return next.handle();
    }

    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const durationMs = Date.now() - startTime;
          const statusCode =
            context.switchToHttp().getResponse<{ statusCode?: number }>()
              .statusCode ?? 200;
          void this.activityLogService
            .logEvent({
              ...activity,
              status: 'success',
              metadata: {
                ...activity.metadata,
                statusCode,
                durationMs,
              },
            })
            .catch((error) =>
              this.logger.warn(
                `Failed to write activity log (success): ${error instanceof Error ? error.message : 'unknown error'}`,
              ),
            );
        },
        error: (error) => {
          const durationMs = Date.now() - startTime;
          const statusCode: number =
            error instanceof Error && 'status' in error
              ? (error as { status: number }).status
              : 500;
          void this.activityLogService
            .logEvent({
              ...activity,
              status: 'failure',
              metadata: {
                ...activity.metadata,
                statusCode,
                durationMs,
                error:
                  error instanceof Error
                    ? error.message
                    : 'unknown_request_error',
              },
            })
            .catch((logError) =>
              this.logger.warn(
                `Failed to write activity log (failure): ${logError instanceof Error ? logError.message : 'unknown error'}`,
              ),
            );
        },
      }),
    );
  }

  private shouldTrack(request: RequestWithUser) {
    const method = request.method.toUpperCase();
    const path = this.getNormalizedPath(request);

    if (!path || path.startsWith('/activity-log')) {
      return false;
    }

    if (path === '/auth/me') {
      return false;
    }

    return ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'].includes(method);
  }

  private shouldPersistAction(action: string) {
    if (!action) return false;
    return action !== 'view';
  }

  private buildActivityPayload(
    request: RequestWithUser,
    user: NonNullable<RequestWithUser['user']>,
  ) {
    const method = request.method.toUpperCase();
    const normalizedPath = this.getNormalizedPath(request);
    const source = this.resolveSource(request);
    const action = this.resolveAction(method, normalizedPath);
    const activityType = this.resolveActivityType(normalizedPath);
    const targetId = this.resolveTargetId(request.params, request.body);
    const targetType = this.resolveTargetType(normalizedPath, request.params);

    return {
      actorUserId: user.userId,
      actorRole: user.role,
      studentId: user.role === 'student' ? user.userId : undefined,
      sessionId: request.cookies?.session_id as string | undefined,
      activityType,
      action,
      targetType,
      targetId,
      source,
      ipAddress: this.resolveIpAddress(request),
      userAgent: request.get('user-agent') || 'unknown',
      requestId: request.get('x-request-id') || '',
      metadata: {
        method,
        path: normalizedPath,
        description: this.buildDescription({
          action,
          role: user.role,
          targetType,
          targetId,
        }),
        params: this.sanitizeObject(request.params),
        query: this.sanitizeObject(request.query as Record<string, unknown>),
        body:
          method === 'GET'
            ? undefined
            : this.sanitizeObject(request.body as Record<string, unknown>),
      },
    };
  }

  private resolveAction(method: string, normalizedPath: string) {
    const matchedRule = ActivityLogInterceptor.actionRules.find(
      (rule) => rule.method === method && rule.pattern.test(normalizedPath),
    );
    if (matchedRule) {
      return matchedRule.action;
    }

    if (method === 'POST') return 'create';
    if (method === 'PATCH' || method === 'PUT') return 'update';
    if (method === 'DELETE') return 'delete';
    return 'view';
  }

  private buildDescription({
    action,
    role,
    targetType,
    targetId,
  }: {
    action: string;
    role: string;
    targetType: string;
    targetId?: string;
  }) {
    const roleLabel: Record<string, string> = {
      admin: 'Admin',
      teacher: 'Giáo viên',
      student: 'Học sinh',
      parent: 'Phụ huynh',
    };

    const actor = roleLabel[role] || 'Người dùng';
    const targetSuffix = targetId
      ? ` (#${targetId.slice(0, 8).toUpperCase()})`
      : '';

    const specificActionMap: Record<string, string> = {
      reset_user_password: 'đặt lại mật khẩu người dùng',
      update_user_status: 'cập nhật trạng thái người dùng',
      create_student: 'tạo tài khoản học sinh',
      update_student: 'cập nhật hồ sơ học sinh',
      delete_student: 'xóa học sinh',
      create_teacher: 'tạo tài khoản giáo viên',
      update_teacher: 'cập nhật hồ sơ giáo viên',
      delete_teacher: 'xóa giáo viên',
      create_parent: 'tạo tài khoản phụ huynh',
      update_parent: 'cập nhật hồ sơ phụ huynh',
      delete_parent: 'xóa phụ huynh',
      create_admin: 'tạo tài khoản quản trị viên',
      update_admin: 'cập nhật hồ sơ quản trị viên',
      delete_admin: 'xóa quản trị viên',
      create_class: 'tạo lớp học',
      update_class: 'cập nhật thông tin lớp học',
      delete_class: 'xóa lớp học',
      enroll_student_to_class: 'thêm học sinh vào lớp',
      remove_student_from_class: 'xóa học sinh khỏi lớp',
      assign_teacher_to_class: 'phân công giáo viên cho lớp',
      remove_teacher_from_class: 'gỡ giáo viên khỏi lớp',
      assign_course_to_class: 'gán khóa học cho lớp',
      update_class_course_status: 'cập nhật trạng thái khóa học trong lớp',
      remove_course_from_class: 'gỡ khóa học khỏi lớp',
      create_course: 'tạo khóa học',
      update_course: 'cập nhật khóa học',
      delete_course: 'xóa khóa học',
      view_course: 'xem khóa học',
      start_learning_course: 'bắt đầu học khóa học',
      create_module: 'tạo module',
      update_module: 'cập nhật module',
      delete_module: 'xóa module',
      create_section: 'tạo section',
      update_section: 'cập nhật section',
      delete_section: 'xóa section',
      assign_teacher_to_course: 'gán giáo viên cho khóa học',
      create_assignment: 'tạo bài tập mới',
      update_assignment: 'cập nhật bài tập',
      delete_assignment: 'xóa bài tập',
      assign_assignment_to_students: 'giao bài tập cho học sinh',
      submit_assignment: 'nộp bài tập',
      grade_assignment: 'chấm điểm bài làm học sinh',
      regrade_assignment_ai: 'yêu cầu AI chấm lại bài',
      view_ai_grading_suggestion: 'xem gợi ý chấm điểm từ AI',
      assign_assignment_to_section: 'gán bài tập vào section',
      remove_assignment_from_section: 'gỡ bài tập khỏi section',
      create_assignment_target: 'tạo đối tượng nhận bài tập',
      delete_assignment_target: 'xóa đối tượng nhận bài tập',
      view_assignment_results: 'xem kết quả bài tập',
      create_question: 'tạo câu hỏi',
      update_question: 'cập nhật câu hỏi',
      delete_question: 'xóa câu hỏi',
      assign_question_to_kp: 'gán câu hỏi vào knowledge point',
      remove_question_from_kp: 'gỡ câu hỏi khỏi knowledge point',
      generate_question: 'tạo câu hỏi bằng AI',
      create_knowledge_point: 'tạo knowledge point',
      update_knowledge_point: 'cập nhật knowledge point',
      delete_knowledge_point: 'xóa knowledge point',
      assign_kp_to_section: 'gán knowledge point vào section',
      remove_kp_from_section: 'gỡ knowledge point khỏi section',
      generate_kp_content: 'tạo nội dung knowledge point bằng AI',
      create_learning_path: 'tạo lộ trình học',
      update_learning_path: 'cập nhật lộ trình học',
      delete_learning_path: 'xóa lộ trình học',
      update_learning_path_item_status:
        'cập nhật trạng thái mục trong lộ trình học',
      submit_question_answer: 'nộp câu trả lời',
      submit_content_question_answer: 'nộp câu trả lời nội dung',
      track_time_on_task: 'ghi nhận thời gian học',
      update_kp_progress: 'cập nhật tiến độ knowledge point',
      upload_avatar: 'tải lên ảnh đại diện',
      upload_file: 'tải lên tệp',
      upload_document: 'tải lên tài liệu',
      clone_course: 'nhân bản khóa học',
      browse_public_courses: 'duyệt danh sách khóa học công khai',
      view_public_course: 'xem chi tiết khóa học công khai',
      search_dashboard: 'tìm kiếm trên dashboard',
    };

    if (specificActionMap[action]) {
      return `${actor} ${specificActionMap[action]}${targetSuffix}`;
    }

    switch (action) {
      case 'delete_user':
        return `${actor} xóa người dùng${targetSuffix}`;
      case 'update_user':
        return `${actor} cập nhật thông tin người dùng${targetSuffix}`;
      case 'create_assignment':
        return `${actor} tạo bài tập mới`;
      case 'grade_assignment':
        return `${actor} chấm điểm bài làm học sinh`;
      case 'submit_assignment':
        return `${actor} nộp bài tập`;
      case 'view_course':
        return `${actor} truy cập khóa học${targetSuffix}`;
      case 'add_student_to_class':
        return `${actor} thêm học sinh vào lớp${targetSuffix}`;
      case 'create':
        return `${actor} tạo ${targetType}${targetSuffix}`;
      case 'update':
        return `${actor} cập nhật ${targetType}${targetSuffix}`;
      case 'delete':
        return `${actor} xóa ${targetType}${targetSuffix}`;
      default:
        return `${actor} ${action.replace(/_/g, ' ')} ${targetType}${targetSuffix}`.trim();
    }
  }

  private resolveTargetId(
    params: Record<string, unknown>,
    body?: Record<string, unknown>,
  ) {
    const prioritizedKeys = [
      'id',
      'userId',
      'studentId',
      'teacherId',
      'classId',
      'courseId',
      'assignmentId',
      'studentAssignmentId',
      'targetId',
      'pathId',
      'itemId',
      'questionId',
      'attemptId',
      'runId',
      'kpId',
      'moduleId',
      'sectionId',
      'parentId',
    ];

    for (const key of prioritizedKeys) {
      const valueFromParams = params?.[key];
      if (typeof valueFromParams === 'string' && valueFromParams.length > 0) {
        return valueFromParams;
      }

      const valueFromBody = body?.[key];
      if (typeof valueFromBody === 'string' && valueFromBody.length > 0) {
        return valueFromBody;
      }
    }

    return undefined;
  }

  private resolveTargetType(
    normalizedPath: string,
    params: Record<string, unknown>,
  ) {
    const keys = Object.keys(params || {});
    const paramKey = keys.find(
      (key) => key.toLowerCase().endsWith('id') && key.toLowerCase() !== 'id',
    );
    if (paramKey) {
      return paramKey.replace(/Id$/i, '').toLowerCase();
    }

    if (keys.includes('id')) {
      const resourceFromPath = this.getResourceFromPath(normalizedPath);
      if (resourceFromPath) {
        return resourceFromPath;
      }
    }

    const idLikeKey = keys.find((key) => key.toLowerCase().endsWith('id'));
    if (idLikeKey) {
      return idLikeKey.replace(/Id$/i, '').toLowerCase();
    }

    return this.getResourceFromPath(normalizedPath) || 'system';
  }

  private resolveActivityType(normalizedPath: string) {
    const firstPathSegment = normalizedPath.split('/').filter(Boolean)[0];
    return firstPathSegment || 'system';
  }

  private resolveIpAddress(request: RequestWithUser) {
    const forwardedFor = request.headers['x-forwarded-for'];
    const resolvedForwardedFor = Array.isArray(forwardedFor)
      ? forwardedFor[0]
      : forwardedFor;
    return (
      resolvedForwardedFor?.split(',')[0]?.trim() || request.ip || 'unknown'
    );
  }

  private resolveSource(request: RequestWithUser) {
    return request.get('x-client-source') || 'web_app';
  }

  private getNormalizedPath(request: RequestWithUser) {
    const rawPath =
      `${request.baseUrl || ''}${request.route?.path || ''}` ||
      request.originalUrl ||
      request.url;
    if (!rawPath) return '';

    let normalized = rawPath
      .replace(/^\/api/, '')
      .replace(/\?.*$/, '')
      .replace(/\/+/g, '/');

    if (normalized.length > 1 && normalized.endsWith('/')) {
      normalized = normalized.slice(0, -1);
    }

    return normalized;
  }

  private getResourceFromPath(normalizedPath: string) {
    const ignoredSegments = new Set([
      'details',
      'with-items',
      'structure',
      'learn',
      'progress',
      'results',
      'targets',
      'status',
      'metadata',
      'prerequisites',
      'dependents',
      'resources',
      'proxy',
      'search',
      'courses-with-progress',
      'dashboard-stats',
      'teacher-stats',
      'difficult-kps',
      'game-completions',
      'class-distribution',
      'learning-health',
      'teacher-highlights',
      'low-progress-classes',
      'available-students',
      'ai-suggestion',
      'regrade-ai',
      'assign-to-students',
      'assign-to-section',
      'assign-to-kp',
      'generate',
      'generate-content',
      'submit-question',
      'submit-content-question',
      'track-time',
      'kp-progress',
      'weekly-activity',
      'attempt-stats',
    ]);

    const segments = normalizedPath.split('/').filter(Boolean);
    for (let index = segments.length - 1; index >= 0; index--) {
      const segment = segments[index];
      if (segment.startsWith(':')) continue;
      if (ignoredSegments.has(segment)) continue;
      return this.toSingular(segment);
    }

    return undefined;
  }

  private toSingular(segment: string) {
    if (segment === 'classes') return 'class';
    if (segment.endsWith('ies')) return `${segment.slice(0, -3)}y`;
    if (segment.endsWith('s') && segment.length > 1)
      return segment.slice(0, -1);
    return segment;
  }

  private sanitizeObject(value: Record<string, unknown> | undefined) {
    if (!value || typeof value !== 'object') {
      return value;
    }

    const sensitiveFields = new Set([
      'password',
      'token',
      'secret',
      'apiKey',
      'api_key',
      'accessToken',
      'idToken',
    ]);

    const sanitized: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value)) {
      if (sensitiveFields.has(key)) {
        sanitized[key] = '***REDACTED***';
      } else if (Array.isArray(item)) {
        sanitized[key] = item.slice(0, 10);
      } else {
        sanitized[key] = item;
      }
    }

    return sanitized;
  }
}
